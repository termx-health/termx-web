import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {catchError, finalize, map, Observable, of, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, group, isDefined} from '@kodality-web/core-util';
import {MapSet} from '../model/map-set';
import {MapSetSearchParams} from '../model/map-set-search-params';
import {MapSetLibService} from '../services/map-set-lib.service';
import {NzSelectItemInterface} from 'ng-zorro-antd/select/select.types';


@Component({
  selector: 'twl-map-set-search',
  templateUrl: './map-set-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MapSetSearchComponent), multi: true}]
})
export class MapSetSearchComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public filter?: (resource: MapSet) => boolean;

  public data: {[id: string]: MapSet} = {};
  public value?: string;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private mapSetLibService: MapSetLibService,
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchMapSets(text)),
    ).subscribe(data => this.data = data);
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchMapSets(text: string): Observable<{[id: string]: MapSet}> {
    if (!text || text.length < 1) {
      return of(this.data);
    }

    const q = new MapSetSearchParams();
    q.textContains = text;
    q.limit = 10_000;

    this.loading['search'] = true;
    return this.mapSetLibService.search(q).pipe(
      map(ca => group(ca.data, c => c.id!)),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadMapSet(id?: string): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.mapSetLibService.load(id).subscribe(c => {
        this.data = {...(this.data || {}), [c.id!]: c};
      }).add(() => this.loading['load'] = false);
    }
  }

  public writeValue(obj: MapSet | string): void {
    this.value = typeof obj === 'object' ? obj?.id : obj;
    this.loadMapSet(this.value);
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
