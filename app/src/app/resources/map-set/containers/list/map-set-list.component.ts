import {Component, OnInit} from '@angular/core';
import {ComponentStateStore, copyDeep, isDefined, QueryParams, SearchResult, sortFn} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {finalize, Observable, tap} from 'rxjs';
import {MapSet, MapSetSearchParams, MapSetVersion} from 'app/src/app/resources/_lib';
import {MapSetService} from '../../services/map-set-service';

interface Filter {
  open: boolean,
  searchInput?: string,
  publisher?: string,
  status?: string,
}

@Component({
  templateUrl: 'map-set-list.component.html'
})
export class MapSetListComponent implements OnInit {
  protected readonly STORE_KEY = 'map-set-list';

  protected query = new MapSetSearchParams();
  protected searchResult: SearchResult<MapSet> = SearchResult.empty();
  protected filter: Filter = {open: false};
  protected _filter: Omit<Filter, 'open'> = this.filter; // temp, use only in tw-table-filter
  protected loading: boolean;

  public constructor(
    private mapSetService: MapSetService,
    private translateService: TranslateService,
    private stateStore: ComponentStateStore,
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.filter = state.filter;
    }

    this.loadData();
  }


  // searches

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  protected onDebounced = (): Observable<SearchResult<MapSet>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected onFilterOpen(): void {
    this.filter.open = true;
    this._filter = structuredClone(this.filter); // copy 'active' to 'temp'
  }

  protected onFilterSearch(): void {
    this.filter = {...structuredClone(this._filter)} as Filter; // copy 'temp' to 'active'
    this.query.offset = 0;
    this.loadData();
  }

  protected onFilterReset(): void {
    this.filter = {open: this.filter.open};
    this._filter = structuredClone(this.filter);
  }

  private search(): Observable<SearchResult<MapSet>> {
    const q = copyDeep(this.query);
    q.lang = this.translateService.currentLang;
    q.textContains = this.filter.searchInput || undefined;
    q.publisher = this.filter.publisher || undefined;
    q.versionStatus = this.filter.status || undefined;
    q.versionsDecorated = true;
    this.stateStore.put(this.STORE_KEY, {query: q, filter: this.filter});

    this.loading = true;
    return this.mapSetService.search(q).pipe(finalize(() => this.loading = false));
  }


  // events

  protected openFhir(id: string): void {
    window.open(`${window.location.origin}/fhir/ConceptMap/${id}`, '_blank');
  }

  protected deleteMapSet(mapSetId: string): void {
    this.mapSetService.delete(mapSetId).subscribe(() => this.loadData());
  }


  // utils

  protected isFilterSelected(filter: Filter): boolean {
    const exclude: (keyof Filter)[] = ['open', 'searchInput'];
    return Object.keys(filter)
      .filter((k: keyof Filter) => !exclude.includes(k))
      .some(k => Array.isArray(filter[k]) ? !!filter[k].length : isDefined(filter[k]));
  }

  protected findLastVersion = (versions: MapSetVersion[]): MapSetVersion => {
    return versions
      ?.filter(v => ['draft', 'active'].includes(v.status))
      .map(v => ({...v, created: v.created ? new Date(v.created) : undefined}))
      .sort(sortFn('created', false))?.[0];
  };
}
