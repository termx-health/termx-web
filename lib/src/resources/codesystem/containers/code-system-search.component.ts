import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {CodeSystem} from '../model/code-system';
import {CodeSystemLibService} from '../services/code-system-lib.service';
import {CodeSystemSearchParams} from '../model/code-system-search-params';
import {NzSelectItemInterface} from 'ng-zorro-antd/select/select.types';


@Component({
  selector: 'twl-code-system-search',
  templateUrl: './code-system-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CodeSystemSearchComponent), multi: true}, DestroyService]
})
export class CodeSystemSearchComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public filter?: (resource: CodeSystem) => boolean;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';
  @Input() @BooleanInput() public multiple: string | boolean;

  public data: {[id: string]: CodeSystem} = {};
  public value?: string | string[];
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private codeSystemService: CodeSystemLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchCodeSystems(text)),
    ).subscribe(data => this.data = data);
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchCodeSystems(text: string): Observable<{[id: string]: CodeSystem}> {
    if (!text || text.length < 1) {
      return of(this.data);
    }

    const q = new CodeSystemSearchParams();
    q.textContains = text;
    q.limit = 10_000;

    this.loading['search'] = true;
    return this.codeSystemService.search(q).pipe(
      takeUntil(this.destroy$),
      map(ca => group(ca.data, c => c.id!)),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadCodeSystems(id?: string): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.codeSystemService.search({ids: id, conceptsDecorated: true, propertiesDecorated: true, versionsDecorated: true})
        .pipe(takeUntil(this.destroy$)).subscribe(resp => {
        this.data = {...(this.data || {}), ...group(resp.data, c => c.id)};
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: CodeSystem | CodeSystem[] | string | string[]): void {
    if (Array.isArray(obj)) {
      this.value = obj.map(p => typeof p === 'object' ? p?.id : p);
      this.loadCodeSystems(this.value.join(','));
    } else {
      this.value = typeof obj === 'object' ? obj?.id : obj;
      this.loadCodeSystems(this.value);
    }
  }

  public fireOnChange(): void {
    if (this.valuePrimitive) {
      this.onChange(this.value);
    } else {
      const v = Array.isArray(this.value) ? this.value.map(id => this.data?.[id]) : this.data?.[this.value];
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
