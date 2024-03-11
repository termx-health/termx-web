import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {DestroyService, group, isDefined, LoadingManager} from '@kodality-web/core-util';
import {catchError, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {StructureDefinition} from './structure-definition';
import {StructureDefinitionLibService} from './structure-definition-lib.service';
import {StructureDefinitionSearchParams} from './structure-definition-search-params';


@Component({
  selector: 'tw-structure-definition-select',
  templateUrl: 'structure-definition-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StructureDefinitionSelectComponent), multi: true}, DestroyService]
})
export class StructureDefinitionSelectComponent implements OnInit, ControlValueAccessor {
  @Input() public valueType: 'id' | 'code' | 'full' = 'full';
  @Input() public placeholder = 'marina.ui.inputs.search.placeholder';

  @Output() public twSelect = new EventEmitter<StructureDefinition>();

  protected data: {[id: string]: StructureDefinition} = {};
  protected value?: number | string;
  protected searchUpdate = new Subject<string>();
  protected loader = new LoadingManager();

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

  protected onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchDefinitions(text: string): Observable<{[id: string]: StructureDefinition}> {
    if (!text || text.length < 1) {
      return of(this.data);
    }

    const q = new StructureDefinitionSearchParams();
    q.textContains = text;
    q.limit = 100;

    return this.loader.wrap('search', this.structureDefinitionService.search(q)).pipe(
      takeUntil(this.destroy$),
      map(ca => group(ca.data, sd => this.valueType === 'id' ? sd.id : sd.code)),
      catchError(() => of(this.data))
    );
  }

  private loadDefinition(val?: number | string): void {
    if (!isDefined(val)) {
      return;
    }

    const q = new StructureDefinitionSearchParams();
    q.ids = typeof val === 'number' ? String(val) : undefined;
    q.code = typeof val === 'string' ? val : undefined;
    q.limit = 1;

    this.loader.wrap('load', this.structureDefinitionService.search(q))
      .pipe(takeUntil(this.destroy$))
      .subscribe(r => {
        this.data = {
          ...(this.data || {}),
          ...group(r.data, sd => this.valueType === 'id' ? sd.id : sd.code)
        };
      });
  }


  public writeValue(obj: StructureDefinition | string | number): void {
    this.value = typeof obj === 'object' ? obj?.code : obj;
    this.loadDefinition(this.value);
  }

  public fireOnChange(): void {
    this.twSelect.emit(this.data?.[this.value]);
    if (['id', 'code'].includes(this.valueType)) {
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
