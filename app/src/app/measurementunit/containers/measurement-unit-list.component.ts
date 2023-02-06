import {Component, OnInit} from '@angular/core';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap, tap} from 'rxjs';
import {ComponentStateStore, copyDeep, QueryParams, SearchResult} from '@kodality-web/core-util';
import {MeasurementUnit, MeasurementUnitSearchParams} from 'terminology-lib/measurementunit';
import {MeasurementUnitService} from '../services/measurement-unit.service';

@Component({
  templateUrl: './measurement-unit-list.component.html',
})
export class MeasurementUnitListComponent implements OnInit {
  protected readonly STORE_KEY = 'measurement-unit-list';

  public query = new MeasurementUnitSearchParams();
  public searchInput?: string;
  public searchUpdate = new Subject<string>();
  public searchResult: SearchResult<MeasurementUnit> = SearchResult.empty();
  public loading = false;

  public constructor(
    private measurementUnitService: MeasurementUnitService,
    private stateStore: ComponentStateStore,
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }

    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      tap(() => this.query.offset = 0),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }


  private search(): Observable<SearchResult<MeasurementUnit>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput || undefined;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.measurementUnitService.search(q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

}
