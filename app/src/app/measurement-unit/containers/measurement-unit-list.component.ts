import {Component, OnInit} from '@angular/core';
import {finalize, Observable, tap} from 'rxjs';
import {ComponentStateStore, copyDeep, QueryParams, SearchResult} from '@kodality-web/core-util';
import {MeasurementUnitService} from '../services/measurement-unit.service';
import {MeasurementUnit, MeasurementUnitSearchParams} from 'term-web/measurement-unit/_lib';

@Component({
  templateUrl: './measurement-unit-list.component.html',
})
export class MeasurementUnitListComponent implements OnInit {
  protected readonly STORE_KEY = 'measurement-unit-list';

  public query = new MeasurementUnitSearchParams();
  public searchResult: SearchResult<MeasurementUnit> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

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
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<MeasurementUnit>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput || undefined;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.measurementUnitService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<MeasurementUnit>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };
}
