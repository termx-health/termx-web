import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, DestroyService, group, isDefined, LoadingManager} from '@kodality-web/core-util';
import {catchError, map, Observable, of, pipe, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {TransformationDefinition} from 'term-web/modeler/_lib/transformer/transformation-definition';
import {TransformationDefinitionQueryParams} from 'term-web/modeler/_lib/transformer/transformation-definition-query.params';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';


@Component({
  selector: 'tw-transformation-definition-select',
  templateUrl: 'transformation-definition-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TransformationDefinitionSelectComponent), multi: true}, DestroyService]
})
export class TransformationDefinitionSelectComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = true;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';

  protected data: {[id: string]: TransformationDefinition} = {};
  protected value?: number;
  protected searchUpdate = new Subject<string>();
  protected loader = new LoadingManager();

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private transformationDefinitionService: TransformationDefinitionService,
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
    q.summary = true;
    q.sort = 'name';
    q.limit = 100;

    return this.loader.wrap('search', this.transformationDefinitionService.search(q)).pipe(
      takeUntil(this.destroy$),
      map(resp => group(resp.data, c => c.id!)),
      catchError(() => of(this.data))
    );
  }

  private loadDefinition(id?: number): void {
    if (isDefined(id)) {
      this.loader.wrap('load', this.transformationDefinitionService.search({ids: id, summary: true, limit: 1})).pipe(
        takeUntil(this.destroy$),
        pipe(map(r => r.data[0]))
      ).subscribe(def => {
        this.data = {...(this.data || {}), [def.id!]: def};
      });
    }
  }


  public writeValue(obj: TransformationDefinition | number): void {
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
}
