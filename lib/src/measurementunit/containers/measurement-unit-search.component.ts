import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {MeasurementUnit} from '../model/measurement-unit';
import {MeasurementUnitLibService} from '../services/measurement-unit-lib.service';
import {MeasurementUnitSearchParams} from '../model/measurement-unit-search-params';

@Component({
  selector: 'twl-measurement-unit-search',
  templateUrl: './measurement-unit-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MeasurementUnitSearchComponent), multi: true}, DestroyService]
})
export class MeasurementUnitSearchComponent implements OnInit {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;

  public data: {[code: string]: MeasurementUnit} = {};
  public value?: string;
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
      this.measurementUnitService.search({code: code, limit: 1}).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        const u = resp.data[0];
        this.data = {[u.code!]: u};
      }).add(() => this.loading['load'] = false);
    }
  }

  public writeValue(obj: MeasurementUnit | string): void {
    this.value = typeof obj === 'object' ? obj?.code : obj;
    this.loadUnit(this.value);
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

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
