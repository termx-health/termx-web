import { Component, forwardRef, Input, OnInit, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { BooleanInput, DestroyService, group, isDefined, KeysPipe, ToBooleanPipe } from '@kodality-web/core-util';
import {NzSelectItemInterface} from 'ng-zorro-antd/select';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {ObservationDefinition} from 'term-web/observation-definition/_lib/models/observation-definition';
import {ObservationDefinitionSearchParams} from 'term-web/observation-definition/_lib/models/observation-definition-search-params';
import {ObservationDefinitionLibService} from 'term-web/observation-definition/_lib/services/observation-definition-lib.service';
import { MuiSelectModule } from '@kodality-web/marina-ui';

import { MarinaUtilModule } from '@kodality-web/marina-util';


@Component({
    selector: 'tw-obs-def-search',
    templateUrl: './observation-definition-search.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ObservationDefinitionSearchComponent), multi: true }, DestroyService],
    imports: [MuiSelectModule, FormsModule, MarinaUtilModule, KeysPipe, ToBooleanPipe]
})
export class ObservationDefinitionSearchComponent implements OnInit, ControlValueAccessor {
  private observationDefinitionService = inject(ObservationDefinitionLibService);
  private destroy$ = inject(DestroyService);

  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public filter?: (resource: ObservationDefinition) => boolean;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';
  @Input() @BooleanInput() public multiple: string | boolean;

  @Input() public idsNe: number | number[];

  public data: {[code: string]: ObservationDefinition} = {};
  public value?: string | string[];
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any): any => x;
  public onTouched = (x: any): any => x;

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
