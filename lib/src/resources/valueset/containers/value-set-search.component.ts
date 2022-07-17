import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {ValueSet} from '../model/value-set';
import {ValueSetLibService} from '../services/value-set-lib.service';
import {ValueSetSearchParams} from '../model/value-set-search-params';
import {NzSelectItemInterface} from 'ng-zorro-antd/select/select.types';


@Component({
  selector: 'twl-value-set-search',
  templateUrl: './value-set-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ValueSetSearchComponent), multi: true}, DestroyService]
})
export class ValueSetSearchComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public filter?: (resource: ValueSet) => boolean;

  public data: {[id: string]: ValueSet} = {};
  public value?: string;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private valueSetService: ValueSetLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchValueSets(text)),
    ).subscribe(data => this.data = data);
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchValueSets(text: string): Observable<{[id: string]: ValueSet}> {
    if (!text || text.length < 1) {
      return of(this.data);
    }

    const q = new ValueSetSearchParams();
    q.textContains = text;
    q.limit = 10_000;

    this.loading['search'] = true;
    return this.valueSetService.search(q).pipe(
      takeUntil(this.destroy$),
      map(ca => group(ca.data, c => c.id!)),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadValueSet(id?: string): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.valueSetService.load(id).pipe(takeUntil(this.destroy$)).subscribe(c => {
        this.data = {...(this.data || {}), [c.id!]: c};
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: ValueSet | string): void {
    this.value = typeof obj === 'object' ? obj?.id : obj;
    this.loadValueSet(this.value);
  }

  public fireOnChange(): void {
    if (this.valuePrimitive) {
      this.onChange(this.value);
    } else {
      this.onChange(this.data?.[this.value!]);
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public filterOption = (_input: string, {nzValue}: NzSelectItemInterface): boolean => {
    return !this.filter || this.filter(this.data[nzValue]);
  };


  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
