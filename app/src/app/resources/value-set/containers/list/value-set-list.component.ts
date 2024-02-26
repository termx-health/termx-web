import {Component, OnInit} from '@angular/core';
import {ComponentStateStore, copyDeep, isDefined, QueryParams, SearchResult, sortFn} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {ValueSet, ValueSetSearchParams, ValueSetVersion} from 'app/src/app/resources/_lib';
import {environment} from 'environments/environment';
import {finalize, Observable, tap} from 'rxjs';
import {ValueSetService} from '../../services/value-set.service';

interface Filter {
  open: boolean,
  searchInput?: string,
  publisher?: string,
  status?: string,
}

@Component({
  selector: 'tw-value-set-list',
  templateUrl: 'value-set-list.component.html',
})
export class ValueSetListComponent implements OnInit {
  protected readonly STORE_KEY = 'value-set-list';

  public query = new ValueSetSearchParams();
  public searchResult: SearchResult<ValueSet> = SearchResult.empty();
  protected filter: Filter = {open: false};
  protected _filter: Omit<Filter, 'open'> = this.filter; // temp, use only in tw-table-filter
  public loading: boolean;

  public constructor(
    private valueSetService: ValueSetService,
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

  protected onDebounced = (): Observable<SearchResult<ValueSet>> => {
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

  private search(): Observable<SearchResult<ValueSet>> {
    const q = copyDeep(this.query);
    q.lang = this.translateService.currentLang;
    q.decorated = true;
    q.textContains = this.filter.searchInput || undefined;
    q.publisher = this.filter.publisher || undefined;
    q.versionStatus = this.filter.status || undefined;
    this.stateStore.put(this.STORE_KEY, {query: q, filter: this.filter});

    this.loading = true;
    return this.valueSetService.search(q).pipe(finalize(() => this.loading = false));
  }


  // events

  protected deleteValueSet(valueSetId: string): void {
    this.valueSetService.deleteValueSet(valueSetId).subscribe(() => this.loadData());
  }

  protected openFhir(id: string): void {
    window.open(`${window.location.origin + environment.baseHref}fhir/ValueSet/${id}`, '_blank');
  }


  // utils

  protected isFilterSelected(filter: Filter): boolean {
    const exclude: (keyof Filter)[] = ['open', 'searchInput'];
    return Object.keys(filter)
      .filter((k: keyof Filter) => !exclude.includes(k))
      .some(k => Array.isArray(filter[k]) ? !!filter[k].length : isDefined(filter[k]));
  }

  protected getVersionTranslateTokens = (version: ValueSetVersion, translateOptions: object): string[] => {
    const tokens = [
      version.releaseDate ? 'web.value-set.list.versions-release-date' : '',
      version.expirationDate ? 'web.value-set.list.versions-expiration-date' : '',
      version.version ? 'web.value-set.list.versions-version' : ''
    ];
    return tokens.filter(Boolean).map(t => this.translateService.instant(t, translateOptions));
  };

  protected findLastVersion = (versions: ValueSetVersion[]): ValueSetVersion => {
    return versions
      ?.filter(v => ['draft', 'active'].includes(v.status))
      .map(v => ({...v, created: v.created ? new Date(v.created) : undefined}))
      .sort(sortFn('created', false))?.[0];
  };
}
