import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, finalize, map, Observable, of, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, group, isDefined} from '@kodality-web/core-util';
import {NamingSystem} from '../model/naming-system';
import {NamingSystemLibService} from '../services/naming-system-lib.service';
import {NamingSystemSearchParams} from '../model/naming-system-search-params';
import {NzSelectItemInterface} from 'ng-zorro-antd/select/select.types';


@Component({
  selector: 'twl-naming-system-search',
  templateUrl: './naming-system-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NamingSystemSearchComponent), multi: true}]
})
export class NamingSystemSearchComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public filter?: (resource: NamingSystem) => boolean;

  public data: {[id: string]: NamingSystem} = {};
  public value?: string;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private namingSystemLibService: NamingSystemLibService,
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchNamingSystems(text)),
    ).subscribe(data => this.data = data);
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchNamingSystems(text: string): Observable<{[id: string]: NamingSystem}> {
    if (!text || text.length < 1) {
      return of(this.data);
    }

    const q = new NamingSystemSearchParams();
    q.textContains = text;
    q.limit = 10_000;

    this.loading['search'] = true;
    return this.namingSystemLibService.search(q).pipe(
      map(ca => group(ca.data, c => c.id!)),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadNamingSystem(id?: string): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.namingSystemLibService.load(id).subscribe(c => {
        this.data = {...(this.data || {}), [c.id!]: c};
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: NamingSystem | string): void {
    this.value = typeof obj === 'object' ? obj?.id : obj;
    this.loadNamingSystem(this.value);
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
