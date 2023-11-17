import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {DestroyService, group, isDefined} from '@kodality-web/core-util';
import {TransformationDefinitionLibService} from './transformation-definition-lib.service';
import {TransformationDefinitionQueryParams} from './transformation-definition-query.params';
import {TransformationDefinition} from './transformation-definition';


@Component({
  selector: 'tw-transformation-definition-select',
  templateUrl: './transformation-definition-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TransformationDefinitionSelectComponent), multi: true}, DestroyService]
})
export class TransformationDefinitionSelectComponent implements OnInit, ControlValueAccessor {
  @Input() public valueType: 'id' | 'name' | 'full' = 'full';
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';

  @Output() public twSelect = new EventEmitter<any>();

  public data: {[id: string]: TransformationDefinition} = {};
  public value?: number | string;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private transformationDefinitionService: TransformationDefinitionLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchDefinitions(text)),
    ).subscribe(data => this.data = data);
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchDefinitions(text: string): Observable<{[id: string]: TransformationDefinition}> {
    if (!text || text.length < 1) {
      return of(this.data);
    }

    const q = new TransformationDefinitionQueryParams();
    q.nameContains = text;
    q.limit = 100;

    this.loading['search'] = true;
    return this.transformationDefinitionService.search(q).pipe(
      takeUntil(this.destroy$),
      map(r => group(r.data, td => this.valueType === 'id' ? td.id : td.name)),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadDefinition(val?: number | string): void {
    if (!isDefined(val)) {
      return;
    }
    this.loading['load'] = true;
    const params:TransformationDefinitionQueryParams = {limit: 1};
    params.ids = typeof val === 'number' ? String(val) : undefined;
    params.name = typeof val === 'string' ? val : undefined;
    this.transformationDefinitionService.search(params).pipe(takeUntil(this.destroy$)).subscribe(r => {
      const data = group(r.data, td => this.valueType === 'id' ? td.id : td.name);
      this.data = {...(this.data || {}), ...data};
    }).add(() => this.loading['load'] = false);
  }

  public writeValue(obj: TransformationDefinition | string | number): void {
    this.value = typeof obj === 'object' ? obj?.name : obj;
    this.loadDefinition(this.value);
  }

  public fireOnChange(): void {
    this.twSelect.emit(this.data?.[String(this.value!)]);
    if (['id', 'name'].includes(this.valueType)) {
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
}
