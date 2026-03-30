import { Component, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { DestroyService, group, isDefined, LoadingManager, KeysPipe } from '@termx-health/core-util';
import { NgChanges, MuiSelectModule } from '@termx-health/ui';
import {catchError, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {PageContent} from 'term-web/wiki/_lib/page/models/page-content';
import {PageContentSearchParams} from 'term-web/wiki/_lib/page/models/page-content-search-params';
import {PageLibService} from 'term-web/wiki/_lib/page/services/page-lib.service';



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
      [autoUnselect]="false">
      @for (key of data | keys; track key) {
        <m-option [mValue]="valueType === 'id' ? data[key]?.id : data[key]?.slug" [mLabel]="data[key].name"/>
      }
    </m-select>
    `,
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PageContentSelectComponent), multi: true }, DestroyService],
    imports: [MuiSelectModule, FormsModule, KeysPipe]
})
export class PageContentSelectComponent implements OnInit, OnChanges, ControlValueAccessor {
  private pageService = inject(PageLibService);
  private destroy$ = inject(DestroyService);

  @Input() public valueType: 'id' | 'slug' | 'full' = 'full';
  @Input() public spaceId?: number;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';

  @Output() public twSelect = new EventEmitter<any>();

  protected data: {[id: string]: PageContent} = {};
  protected value?: number | string;
  protected searchUpdate = new Subject<string>();
  protected loader = new LoadingManager();

  private onChange = (x: any): any => x;
  private onTouched = (x: any): any => x;


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
      map(ca => group(ca.data, p => this.valueType === 'id' ? p.id : p.slug)),
      catchError(() => of(this.data)),
    );
    return this.loader.wrap('space', req$);
  }

  private loadPage(val?: number | string): void {
    if (!isDefined(val)) {
      return;
    }
    const params:PageContentSearchParams = {limit: 1};
    params.ids = typeof val === 'number' ? String(val) : undefined;
    params.slugs = typeof val === 'string' ? val : undefined;
    this.loader.wrap('load', this.pageService.searchPageContents(params).pipe(takeUntil(this.destroy$))).subscribe(r => {
      const data = group(r.data, td => this.valueType === 'id' ? td.id : td.slug);
      this.data = {...(this.data || {}), ...data};
    });
  }


  /* CVA */

  public writeValue(obj: PageContent | string | number): void {
    this.value = typeof obj === 'object' ? obj?.slug : obj;
    this.loadPage(this.value);
  }

  public fireOnChange(): void {
    this.twSelect.emit(this.data?.[String(this.value!)]);
    if (['id', 'slug'].includes(this.valueType)) {
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
