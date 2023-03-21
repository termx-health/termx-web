import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {MapSetEntityVersionLibService} from '../services/map-set-entity-version-lib.service';
import {MapSetEntityVersion} from '../model/map-set-entity-version';
import {MapSetLibService} from '../services/map-set-lib.service';
import {MapSetEntityVersionSearchParams} from '../model/map-set-entity-version-search-params';

@Component({
  selector: 'tw-map-set-entity-version-search',
  templateUrl: './map-set-entity-version-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MapSetEntityVersionSearchComponent), multi: true}, DestroyService]
})
export class MapSetEntityVersionSearchComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;
  @Input() public mapSetId?: string;

  public data: {[id: string]: MapSetEntityVersion} = {};
  public value?: number;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private mapSetService: MapSetLibService,
    private mapSetEntityVersionService: MapSetEntityVersionLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchMapSetEntityVersions(text)),
    ).subscribe(data => this.data = data);
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchMapSetEntityVersions(text: string): Observable<{[id: string]: MapSetEntityVersion}> {
    if (!text || text.length < 1 || !this.mapSetId) {
      return of(this.data);
    }

    const q = new MapSetEntityVersionSearchParams();
    q.limit = 10_000;
    q.mapSet = this.mapSetId;
    q.descriptionContains = text;

    this.loading['search'] = true;
    return this.mapSetService.searchEntityVersions(this.mapSetId, q).pipe(
      takeUntil(this.destroy$),
      map(msev => group(msev.data, ev => ev.id!.toString())),
      catchError(() => of(this.data)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadMapSetEntityVersion(id?: number): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.mapSetEntityVersionService.load(id).pipe(takeUntil(this.destroy$)).subscribe(c => {
        this.data = {...(this.data || {}), [c.id!]: c};
      }).add(() => this.loading['load'] = false);
    }
  }


  public writeValue(obj: MapSetEntityVersion | number): void {
    this.value = typeof obj === 'object' ? obj?.id : obj;
    this.loadMapSetEntityVersion(this.value);
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

}
