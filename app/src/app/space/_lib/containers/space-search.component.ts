import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {Space} from '../model/space';
import {SpaceSearchParams} from '../model/space-search-params';
import {SpaceLibService} from 'term-web/space/_lib';

@Component({
  selector: 'tw-space-search',
  templateUrl: './space-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SpaceSearchComponent), multi: true}, DestroyService]
})
export class SpaceSearchComponent implements OnInit {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;

  public data: {[id: number]: Space} = {};
  public value?: number;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private spaceService: SpaceLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchSpaces(text)),
    ).subscribe(data => this.data = data);
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchSpaces(text: string): Observable<{[id: number]: Space}> {
    if (!text || text.length === 1) {
      return of(this.data!);
    }

    const q = new SpaceSearchParams();
    q.textContains = text;
    q.limit = 10_000;

    this.loading['search'] = true;
    return this.spaceService.search(q).pipe(
      takeUntil(this.destroy$),
      map(spaces => group(spaces.data, s => s.id)),
      catchError(() => of(this.data!)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadSpace(id?: number): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.spaceService.load(id).pipe(takeUntil(this.destroy$)).subscribe(s => {
        this.data = {[s.id]: s};
      }).add(() => this.loading['load'] = false);
    }
  }

  public writeValue(obj: Space | number): void {
    this.value = typeof obj === 'object' ? obj?.id : obj;
    this.loadSpace(this.value);
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
