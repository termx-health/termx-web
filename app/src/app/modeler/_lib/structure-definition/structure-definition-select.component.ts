import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {StructureDefinitionLibService} from './structure-definition-lib.service';
import {StructureDefinition} from './structure-definition';
import {StructureDefinitionSearchParams} from './structure-definition-search-params';


@Component({
  selector: 'tw-structure-definition-select',
  templateUrl: './structure-definition-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StructureDefinitionSelectComponent), multi: true}, DestroyService]
})
export class StructureDefinitionSelectComponent implements OnInit, ControlValueAccessor {
  @Input() public valueType: 'id' | 'code' | 'full' = 'full';

  @Input() @BooleanInput() public valuePrimitive: string | boolean = true;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';

  @Output() public twSelect = new EventEmitter<any>();

  public data: {[id: string]: StructureDefinition} = {};
  public value?: number | string;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private structureDefinitionService: StructureDefinitionLibService,
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

  private searchDefinitions(text: string): Observable<{[id: string]: StructureDefinition}> {
    if (!text || text.length < 1) {
      return of(this.data);
    }

    const q = new StructureDefinitionSearchParams();
    q.textContains = text;
    q.limit = 100;

    this.loading['search'] = true;
    return this.structureDefinitionService.search(q).pipe(
      takeUntil(this.destroy$),
      map(ca => group(ca.data, sd => this.valueType === 'id' ? sd.id : sd.code)),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadDefinition(val?: number | string): void {
    if (!isDefined(val)) {
      return;
    }
    this.loading['load'] = true;
    const params:StructureDefinitionSearchParams = {limit: 1};
    params.ids = typeof val === 'number' ? String(val) : undefined;
    params.code = typeof val === 'string' ? val : undefined;
    this.structureDefinitionService.search(params).pipe(takeUntil(this.destroy$)).subscribe(r => {
      const data = group(r.data, sd => this.valueType === 'id' ? sd.id : sd.code);
      this.data = {...(this.data || {}), ...data};
    }).add(() => this.loading['load'] = false);
  }

  public writeValue(obj: StructureDefinition | string | number): void {
    this.value = typeof obj === 'object' ? obj?.code : obj;
    this.loadDefinition(this.value);
  }

  public fireOnChange(): void {
    this.twSelect.emit(this.data?.[String(this.value!)]);
    if (['id', 'code'].includes(this.valueType)) {
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
