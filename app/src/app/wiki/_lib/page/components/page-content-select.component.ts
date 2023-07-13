import {Component, forwardRef, Input, OnChanges, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, DestroyService, group, isDefined, LoadingManager} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {PageLibService} from '../services/page-lib.service';
import {NgChanges} from '@kodality-web/marina-ui';
import {PageContent} from '../models/page-content';
import {PageContentSearchParams} from '../models/page-content-search-params';


@Component({
  selector: 'tw-page-content-select',
  template: `
    <m-select
        icon="search"
        [placeholder]="placeholder"
        [(ngModel)]="value"
        (mInputChange)="onSearch($event)"
        (mChange)="fireOnChange()"
        [loading]="loader.isLoading"
        [autoUnselect]="false"
    >
      <m-option *ngFor="let key of data | keys" [mValue]="data[key].id" [mLabel]="data[key].name"/>
    </m-select>
  `,
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PageContentSelectComponent), multi: true}, DestroyService]
})
export class PageContentSelectComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean;
  @Input() public spaceId?: number;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';

  protected data: {[id: string]: PageContent} = {};
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
      switchMap(text => this.searchPageContents(text)),
    ).subscribe(data => this.data = data);
  }

  public ngOnChanges(changes: NgChanges<PageContentSelectComponent>): void {
    if (changes.spaceId && !changes.spaceId.firstChange) {
      this.data = {};
      this.value = undefined;
      setTimeout(() => this.fireOnChange());
    }
  }


  protected onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchPageContents(text: string): Observable<{[id: string]: PageContent}> {
    if (!text || text.length < 1) {
      return of(this.data);
    }

    const q = new PageContentSearchParams();
    q.spaceIds = this.spaceId;
    q.textContains = text;
    q.limit = 100;

    const req$ = this.pageService.searchPageContents(q).pipe(
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

  public writeValue(obj: PageContent | number): void {
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
}
