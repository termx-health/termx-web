import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {NzSelectItemInterface} from 'ng-zorro-antd/select/select.types';
import {catchError, finalize, map, Observable, of, Subject, takeUntil, forkJoin} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {ArrayUtil} from 'term-web/core/utils/array-util';
import {ValueSet} from '../model/value-set';
import {ValueSetSearchParams} from '../model/value-set-search-params';
import {ValueSetLibService} from '../services/value-set-lib.service';


@Component({
  selector: 'tw-value-set-search',
  templateUrl: './value-set-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ValueSetSearchComponent), multi: true}, DestroyService]
})
export class ValueSetSearchComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public disabled: string | boolean = false;
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() @BooleanInput() public autoUnselect: string | boolean = false;
  @Input() @BooleanInput() public multiple: string | boolean;
  @Input() public filter?: (resource: ValueSet) => boolean;

  @Output() public twSelect = new EventEmitter<any>();

  public data: {[id: string]: ValueSet} = {};
  public value?: string | string[];
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

  private loadValueSets(ids?: string[]): void {
    if (isDefined(ids) && ids.length > 0) {
      this.loading['load'] = true;

      const batches = ArrayUtil.batchArray(ids, 100);
      const requests = batches.map(batch => this.valueSetService.search({ids: batch.join(','), decorated: true}).pipe(takeUntil(this.destroy$)));
      forkJoin(requests).subscribe(responses => {
        responses.forEach(resp => this.data = { ...(this.data || {}), ...group(resp.data, vs => vs.id)});
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: ValueSet | ValueSet[] | string | string[]): void {
    if (Array.isArray(obj)) {
      this.value = obj.map(p => typeof p === 'object' ? p?.id : p);
      this.loadValueSets(this.value);
    } else {
      this.value = typeof obj === 'object' ? obj?.id : obj;
      this.loadValueSets([this.value]);
    }
  }

  public fireOnChange(): void {
    this.twSelect.emit(Array.isArray(this.value) ? this.value.map(id => this.data?.[id]) : this.data?.[this.value]);
    if (this.valuePrimitive) {
      this.onChange(this.value);
    } else {
      const v = Array.isArray(this.value) ? this.value.map(id => this.data?.[id]) : this.data?.[this.value];
      this.onChange(v);
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
