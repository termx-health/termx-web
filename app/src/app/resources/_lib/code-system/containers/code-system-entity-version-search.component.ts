import {Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {CodeSystemEntityVersion, CodeSystemEntityVersionLibService, CodeSystemEntityVersionSearchParams, CodeSystemLibService} from '../../code-system';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NzSelectItemInterface} from 'ng-zorro-antd/select/select.types';

@Component({
  selector: 'tw-code-system-entity-version-search',
  templateUrl: './code-system-entity-version-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CodeSystemEntityVersionSearchComponent), multi: true}, DestroyService]
})
export class CodeSystemEntityVersionSearchComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public placeholder: string = 'marina.ui.inputs.select.placeholder';
  @Input() public entityCode?: string;
  @Input() public codeSystem?: string;
  @Input() public codesNe?: string;

  public data: {[id: string]: CodeSystemEntityVersion} = {};
  public value?: number;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private codeSystemEntityVersionLibService: CodeSystemEntityVersionLibService,
    private codeSystemService: CodeSystemLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchEntities(text)),
    ).subscribe(data => this.data = data);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['codeSystem'] || changes['entityCode'] || changes['codesNe']) && this.codeSystem && this.entityCode) {
      this.codeSystemService.searchEntityVersions(this.codeSystem, {code: this.entityCode, codesNe: this.codesNe, limit: -1})
        .subscribe(resp => this.data = ({...group(resp.data, csev => csev.id)}));
    }
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchEntities(text: string): Observable<{[id: string]: CodeSystemEntityVersion}> {
    if (!text || !this.codeSystem) {
      return of(this.data);
    }

    const q = new CodeSystemEntityVersionSearchParams();
    q.textContains = text;
    q.codeSystem = this.codeSystem;
    q.codesNe = this.codesNe;
    q.limit = 10_000;

    this.loading['search'] = true;
    return this.codeSystemService.searchEntityVersions(this.codeSystem, q).pipe(
      takeUntil(this.destroy$),
      map(cseva => ({...this.data, ...group(cseva.data, csev => csev.id!)})),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadCodeSystemEntityVersion(id?: number): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.codeSystemEntityVersionLibService.load(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(csev => this.data = {...(this.data || {}), [csev.id!]: csev})
        .add(() => this.loading['load'] = false);
    }
  }

  public writeValue(obj: CodeSystemEntityVersion | number): void {
    this.value = (typeof obj === 'object' ? obj?.id : obj);
    this.loadCodeSystemEntityVersion(this.value);
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

  public filterOption = (_input: string, {nzValue}: NzSelectItemInterface): boolean => {
    const i = _input?.toLowerCase();
    return this.data[nzValue].code?.toLowerCase()?.includes(i) || !!this.data[nzValue].designations?.find(d => d.name?.toLowerCase()?.includes(i));
  };
}
