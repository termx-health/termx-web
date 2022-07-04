import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, finalize, map, Observable, of, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, group, isDefined} from '@kodality-web/core-util';
import {CodeSystem} from '../model/code-system';
import {CodeSystemLibService} from '../services/code-system-lib.service';
import {CodeSystemSearchParams} from '../model/code-system-search-params';
import {NzSelectItemInterface} from 'ng-zorro-antd/select/select.types';


@Component({
  selector: 'twl-code-system-search',
  templateUrl: './code-system-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CodeSystemSearchComponent), multi: true}]
})
export class CodeSystemSearchComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public filter?: (resource: CodeSystem) => boolean;

  public data: {[id: string]: CodeSystem} = {};
  public value?: string;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private codeSystemService: CodeSystemLibService,
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
      map(ca => group(ca.data, c => c.id!)),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadCodeSystem(id?: string): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.codeSystemService.load(id).subscribe(c => {
        this.data = {...(this.data || {}), [c.id!]: c};
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: CodeSystem | string): void {
    this.value = typeof obj === 'object' ? obj?.id : obj;
    this.loadCodeSystem(this.value);
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

  public filterOption = (_input: string, {nzValue}: NzSelectItemInterface): boolean => {
    return !this.filter || this.filter(this.data[nzValue]);
  };


  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
