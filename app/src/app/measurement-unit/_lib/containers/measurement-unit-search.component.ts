import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {MeasurementUnit} from '../model/measurement-unit';
import {MeasurementUnitSearchParams} from '../model/measurement-unit-search-params';
import {MeasurementUnitLibService} from '../services/measurement-unit-lib.service';

@Component({
  selector: 'tw-measurement-unit-search',
  templateUrl: './measurement-unit-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MeasurementUnitSearchComponent), multi: true}, DestroyService]
})
export class MeasurementUnitSearchComponent implements OnInit {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() @BooleanInput() public multiple: string | boolean;

  public data: {[code: string]: MeasurementUnit} = {};
  public value?: string | string[];
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private measurementUnitService: MeasurementUnitLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchUnits(text)),
    ).subscribe(data => this.data = data);
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchUnits(text: string): Observable<{[code: string]: MeasurementUnit}> {
    if (!text || text.length === 1) {
      return of(this.data!);
    }

    const q = new MeasurementUnitSearchParams();
    q.textContains = text;
    q.limit = 10_000;

    this.loading['search'] = true;
    return this.measurementUnitService.search(q).pipe(
      takeUntil(this.destroy$),
      map(units => group(units.data, u => u.code!)),
      catchError(() => of(this.data!)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadUnit(code?: string): void {
    if (isDefined(code)) {
      this.loading['load'] = true;
      this.measurementUnitService.search({code: code, limit: code.split(',')?.length}).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        this.data = group(resp.data, d => d.code);
      }).add(() => this.loading['load'] = false);
    }
  }

  public writeValue(obj: MeasurementUnit | MeasurementUnit[] | string | string[]): void {
    if (Array.isArray(obj)) {
      this.value = obj.map(o => typeof o === 'object' ? o?.code : o);
      this.loadUnit(this.value.join(','));
    } else {
      this.value = typeof obj === 'object' ? obj?.code : obj;
      this.loadUnit(this.value);
    }
  }

  public fireOnChange(): void {
    if (this.valuePrimitive) {
      this.onChange(this.value);
    } else {
      const v = Array.isArray(this.value) ? this.value.map(code => this.data?.[code]) : this.data?.[this.value];
      this.onChange(v);
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
}
