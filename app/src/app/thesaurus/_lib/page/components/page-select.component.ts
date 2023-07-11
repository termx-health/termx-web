import {Component, forwardRef, Input, OnChanges, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, DestroyService, group, isDefined, LoadingManager} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {PageLibService} from '../services/page-lib.service';
import {Page} from '../models/page';
import {PageSearchParams} from '../models/page-search-params';
import {NgChanges} from '@kodality-web/marina-ui';


@Component({
  selector: 'tw-page-select',
  templateUrl: 'page-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PageSelectComponent), multi: true}, DestroyService]
})
export class PageSelectComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';
  @Input() public idNe?: number;
  @Input() public spaceId?: number;

  protected data: {[id: string]: Page} = {};
  protected value?: number;
  protected searchUpdate = new Subject<string>();
  protected loader = new LoadingManager();

  private onChange = (x: any) => x;
  private onTouched = (x: any) => x;

  public constructor(
    private pageService: PageLibService,
    private translateService: TranslateService,
    private destroy$: DestroyService
  ) {}


  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchPages(text)),
    ).subscribe(data => this.data = data);
  }

  public ngOnChanges(changes: NgChanges<PageSelectComponent>): void {
    if (changes.spaceId && !changes.spaceId.firstChange) {
      this.data = {};
      this.value = undefined;
      setTimeout(() => this.fireOnChange());
    }
  }

  protected onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchPages(text: string): Observable<{[id: string]: Page}> {
    if (!text || text.length < 1) {
      return of(this.data);
    }

    const q = new PageSearchParams();
    q.idsNe = this.idNe;
    q.spaceIds = this.spaceId;
    q.textContains = text;
    q.limit = 100;

    const req$ = this.pageService.searchPages(q).pipe(
      takeUntil(this.destroy$),
      map(ca => group(ca.data, c => c.id!)),
      catchError(() => of(this.data)),
    );
    return this.loader.wrap('space', req$);
  }

  private loadPage(id?: number): void {
    if (isDefined(id)) {
      this.loader.wrap('load', this.pageService.loadPage(id)).pipe(takeUntil(this.destroy$)).subscribe(c => {
        this.data = {...(this.data || {}), [c.id!]: c};
      });
    }
  }


  /* CVA */

  public writeValue(obj: Page | number): void {
    this.value = typeof obj === 'object' ? obj?.id : obj;
    this.loadPage(this.value);
  }

  public fireOnChange(): void {
    if (this.valuePrimitive) {
      this.onChange(this.value);
    } else {
      this.onChange(this.data?.[String(this.value!)]);
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }


  /* Utils */

  protected localizedContentName = (page: Page): string | undefined => {
    return page?.contents?.find(c => c.lang === this.translateService.currentLang)?.name || page?.contents?.[0]?.name;
  };
}
