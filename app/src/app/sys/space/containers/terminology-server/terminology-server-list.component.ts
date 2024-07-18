import {Component, OnInit} from '@angular/core';
import {ComponentStateStore, copyDeep, QueryParams, SearchResult} from '@kodality-web/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {TerminologyServer, TerminologyServerLibService, TerminologyServerSearchParams} from 'term-web/sys/_lib/space';

@Component({
  templateUrl: './terminology-server-list.component.html',
})
export class TerminologyServerListComponent implements OnInit {
  public query = new TerminologyServerSearchParams();
  public searchResult: SearchResult<TerminologyServer> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  protected readonly STORE_KEY = 'terminology-server-list';

  public constructor(
    private terminologyServerService: TerminologyServerLibService,
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

  private search(): Observable<SearchResult<TerminologyServer>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.terminologyServerService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<TerminologyServer>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };
}
