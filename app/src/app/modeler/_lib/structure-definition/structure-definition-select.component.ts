import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {StructureDefinitionLibService} from './structure-definition-lib.service';
import {StructureDefinition} from './structure-definition';
import {StructureDefinitionSearchParams} from './structure-definition-search-params';


@Component({
  selector: 'tw-structure-definition-select',
  templateUrl: './structure-definition-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StructureDefinitionSelectComponent), multi: true}, DestroyService]
})
export class StructureDefinitionSelectComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = true;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';

  public data: {[id: string]: StructureDefinition} = {};
  public value?: number;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private structureDefinitionService: StructureDefinitionLibService,
    private translateService: TranslateService,
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
      map(ca => group(ca.data, c => c.id!)),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadDefinition(id?: number): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.structureDefinitionService.load(id).pipe(takeUntil(this.destroy$)).subscribe(c => {
        this.data = {...(this.data || {}), [c.id!]: c};
      }).add(() => this.loading['load'] = false);
    }
  }

  public writeValue(obj: StructureDefinition | number): void {
    this.value = typeof obj === 'object' ? obj?.id : obj;
    this.loadDefinition(this.value);
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
}
