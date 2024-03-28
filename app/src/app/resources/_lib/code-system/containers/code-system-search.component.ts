import {Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {NzSelectItemInterface} from 'ng-zorro-antd/select/select.types';
import {catchError, finalize, map, Observable, of, Subject, takeUntil, forkJoin} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {ArrayUtil} from 'term-web/core/utils/array-util';
import {CodeSystem, CodeSystemLibService, CodeSystemSearchParams} from '../../code-system';


@Component({
  selector: 'tw-code-system-search',
  templateUrl: './code-system-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CodeSystemSearchComponent), multi: true}, DestroyService]
})
export class CodeSystemSearchComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public disabled: string | boolean = false;
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() @BooleanInput() public autoUnselect: string | boolean = false;
  @Input() @BooleanInput() public multiple: string | boolean;
  @Input() public filter?: (resource: CodeSystem) => boolean;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';

  @Output() public twSelect = new EventEmitter<any>();

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

  private loadCodeSystems(ids?: string[]): void {
    if (isDefined(ids) && ids.length > 0) {
      this.loading['load'] = true;

      const batches = ArrayUtil.batchArray(ids, 100);
      const requests = batches.map(batch => this.codeSystemService.search({ids: batch.join(','), propertiesDecorated: true, versionsDecorated: true})
        .pipe(takeUntil(this.destroy$)));
      forkJoin(requests).subscribe(responses => {
        responses.forEach(resp => this.data = { ...(this.data || {}), ...group(resp.data, c => c.id)});
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: CodeSystem | CodeSystem[] | string | string[]): void {
    if (Array.isArray(obj)) {
      this.value = obj.map(p => typeof p === 'object' ? p?.id : p);
      this.loadCodeSystems(this.value);
    } else {
      this.value = typeof obj === 'object' ? obj?.id : obj;
      this.loadCodeSystems([this.value]);
    }
  }

  public fireOnChange(): void {
    this.twSelect.emit(Array.isArray(this.value) ? this.value.map(id => this.data?.[id]) : this.data?.[this.value]);
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
