import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {Page} from '../model/page';
import {ThesaurusLibService} from '../services/thesaurus-lib.service';
import {PageSearchParams} from '../model/page-search-params';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'twl-page-select',
  templateUrl: './page-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PageSelectComponent), multi: true}, DestroyService]
})
export class PageSelectComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = true;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';
  @Input() public idNe?: number;

  public data: {[id: string]: Page} = {};
  public value?: number;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private thesaurusService: ThesaurusLibService,
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

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchPages(text: string): Observable<{[id: string]: Page}> {
    if (!text || text.length < 1) {
      return of(this.data);
    }

    const q = new PageSearchParams();
    q.idNe = this.idNe;
    q.textContains = text;
    q.limit = 100;

    this.loading['search'] = true;
    return this.thesaurusService.searchPages(q).pipe(
      takeUntil(this.destroy$),
      map(ca => group(ca.data, c => c.id!)),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadPage(id?: number): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.thesaurusService.loadPage(id).pipe(takeUntil(this.destroy$)).subscribe(c => {
        this.data = {...(this.data || {}), [c.id!]: c};
      }).add(() => this.loading['load'] = false);
    }
  }


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

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

  public localizedContentName = (page: Page): string | undefined => {
    return page?.contents?.find(c => c.lang === this.translateService.currentLang)?.name || page?.contents?.[0]?.name;
  };
}
