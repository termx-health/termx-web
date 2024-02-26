import {Component, OnInit} from '@angular/core';
import {ComponentStateStore, copyDeep, LoadingManager, QueryParams, SearchResult} from '@kodality-web/core-util';
import {Observable, tap} from 'rxjs';
import {Release, ReleaseLibService, ReleaseSearchParams} from 'term-web/sys/_lib';

@Component({
  templateUrl: './release-list.component.html',
})
export class ReleaseListComponent implements OnInit {
  public query = new ReleaseSearchParams();
  public searchResult: SearchResult<Release> = SearchResult.empty();
  public searchInput: string;
  public loader = new LoadingManager();

  protected readonly STORE_KEY = 'release-list';

  public constructor(
    private releaseService: ReleaseLibService,
    private stateStore: ComponentStateStore,
  ) { }

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

  private search(): Observable<SearchResult<Release>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('load', this.releaseService.search(q));
  }

  public onSearch = (): Observable<SearchResult<Release>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };
}
