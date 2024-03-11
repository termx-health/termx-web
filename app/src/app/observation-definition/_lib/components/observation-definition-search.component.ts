import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {NzSelectItemInterface} from 'ng-zorro-antd/select/select.types';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {ObservationDefinition} from '../models/observation-definition';
import {ObservationDefinitionSearchParams} from '../models/observation-definition-search-params';
import {ObservationDefinitionLibService} from '../services/observation-definition-lib.service';


@Component({
  selector: 'tw-obs-def-search',
  templateUrl: './observation-definition-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ObservationDefinitionSearchComponent), multi: true}, DestroyService]
})
export class ObservationDefinitionSearchComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public filter?: (resource: ObservationDefinition) => boolean;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';
  @Input() @BooleanInput() public multiple: string | boolean;

  @Input() public idsNe: number | number[];

  public data: {[code: string]: ObservationDefinition} = {};
  public value?: string | string[];
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private observationDefinitionService: ObservationDefinitionLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchObservationDefinitions(text)),
    ).subscribe(data => this.data = data);
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchObservationDefinitions(text: string): Observable<{[code: string]: ObservationDefinition}> {
    if (!text || text.length < 1) {
      return of(this.data);
    }

    const q = new ObservationDefinitionSearchParams();
    q.textContains = text;
    q.idsNe = isDefined(this.idsNe) ? (typeof this.idsNe === 'number' ? String(this.idsNe) : this.idsNe.join(',')) : undefined;
    q.limit = 10_000;

    this.loading['search'] = true;
    return this.observationDefinitionService.search(q).pipe(
      takeUntil(this.destroy$),
      map(od => group(od.data, def => def.code!)),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadObservationDefinitions(code?: string): void {
    if (isDefined(code)) {
      this.loading['load'] = true;
      this.observationDefinitionService.search({codes: code})
        .pipe(takeUntil(this.destroy$)).subscribe(resp => {
        this.data = {...(this.data || {}), ...group(resp.data, def => def.code)};
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: ObservationDefinition | ObservationDefinition[] | string | string[]): void {
    if (Array.isArray(obj)) {
      this.value = obj.map(p => typeof p === 'object' ? p?.code : p);
      this.loadObservationDefinitions(this.value.join(','));
    } else {
      this.value = typeof obj === 'object' ? obj?.code : obj;
      this.loadObservationDefinitions(this.value);
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

  public filterOption = (_input: string, {nzValue}: NzSelectItemInterface): boolean => {
    return !this.filter || this.filter(this.data[nzValue]);
  };


  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
