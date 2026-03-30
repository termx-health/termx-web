import { Component, forwardRef, Input, OnChanges, OnInit, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { BooleanInput, DestroyService, group, isDefined, LoadingManager, ApplyPipe, KeysPipe } from '@termx-health/core-util';
import { NgChanges, MuiSelectModule } from '@termx-health/ui';
import {TranslateService} from '@ngx-translate/core';
import {catchError, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Page} from 'term-web/wiki/_lib/page/models/page';
import {PageSearchParams} from 'term-web/wiki/_lib/page/models/page-search-params';
import {PageLibService} from 'term-web/wiki/_lib/page/services/page-lib.service';



@Component({
    selector: 'tw-page-select',
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
      @for (key of data | keys; track key) {
        <m-option [mValue]="data[key].id" [mLabel]="data[key] | apply: localizedContentName"/>
      }
    </m-select>
    `,
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PageSelectComponent), multi: true }, DestroyService],
    imports: [MuiSelectModule, FormsModule, ApplyPipe, KeysPipe]
})
export class PageSelectComponent implements OnInit, OnChanges, ControlValueAccessor {
  private pageService = inject(PageLibService);
  private translateService = inject(TranslateService);
  private destroy$ = inject(DestroyService);

  @Input() @BooleanInput() public valuePrimitive: string | boolean;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';
  @Input() public idNe?: number;
  @Input() public spaceId?: number;

  protected data: {[id: string]: Page} = {};
  protected value?: number;
  protected searchUpdate = new Subject<string>();
  protected loader = new LoadingManager();

  private onChange = (x: any): any => x;
  private onTouched = (x: any): any => x;


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
