import { Component, EventEmitter, forwardRef, Input, OnInit, Output, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { DestroyService, group, isDefined, LoadingManager, KeysPipe } from '@termx-health/core-util';
import {catchError, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {TransformationDefinition} from 'term-web/modeler/_lib/transformer/transformation-definition';
import {TransformationDefinitionLibService} from 'term-web/modeler/_lib/transformer/transformation-definition-lib.service';
import {TransformationDefinitionQueryParams} from 'term-web/modeler/_lib/transformer/transformation-definition-query.params';
import { MuiSelectModule } from '@termx-health/ui';



@Component({
    selector: 'tw-transformation-definition-select',
    templateUrl: 'transformation-definition-select.component.html',
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TransformationDefinitionSelectComponent), multi: true }, DestroyService],
    imports: [MuiSelectModule, FormsModule, KeysPipe]
})
export class TransformationDefinitionSelectComponent implements OnInit, ControlValueAccessor {
  private transformationDefinitionService = inject(TransformationDefinitionLibService);
  private destroy$ = inject(DestroyService);

  @Input() public valueType: 'id' | 'name' | 'full' = 'full';
  @Input() public placeholder = 'marina.ui.inputs.search.placeholder';

  @Output() public twSelect = new EventEmitter<TransformationDefinition>();

  protected data: {[id: string]: TransformationDefinition} = {};
  protected value?: number | string;
  protected searchUpdate = new Subject<string>();
  protected loader = new LoadingManager();

  public onChange = (x: any): any => x;
  public onTouched = (x: any): any => x;

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchDefinitions(text)),
    ).subscribe(data => this.data = data);
  }

  protected onSearch(text: string): void {
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
      map(r => group(r.data, td => this.valueType === 'id' ? td.id : td.name)),
      catchError(() => of(this.data)),
    );
  }

  private loadDefinition(val?: number | string): void {
    if (!isDefined(val)) {
      return;
    }

    const q = new TransformationDefinitionQueryParams();
    q.ids = typeof val === 'number' ? val : undefined;
    q.name = typeof val === 'string' ? val : undefined;
    q.summary = true;
    q.limit = 1;

    this.loader.wrap('load', this.transformationDefinitionService.search(q))
      .pipe(takeUntil(this.destroy$))
      .subscribe(r => {
        this.data = {
          ...(this.data || {}),
          ...group(r.data, td => this.valueType === 'id' ? td.id : td.name)
        };
      });
  }


  public writeValue(obj: TransformationDefinition | string | number): void {
    this.value = typeof obj === 'object' ? obj?.name : obj;
    this.loadDefinition(this.value);
  }

  public fireOnChange(): void {
    this.twSelect.emit(this.data?.[this.value]);

    if (['id', 'name'].includes(this.valueType)) {
      this.onChange(this.value);
    } else {
      this.onChange(this.data?.[this.value]);
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
