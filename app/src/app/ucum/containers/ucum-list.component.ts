import {Component, OnInit} from '@angular/core';
import {ComponentStateStore, copyDeep, QueryParams, SearchResult} from '@kodality-web/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {Ucum, UcumSearchParams} from 'term-web/ucum/_lib';
import {UcumService} from '../services/ucum.service';

@Component({
  templateUrl: './ucum-list.component.html',
})
export class UcumListComponent implements OnInit {
  protected readonly STORE_KEY = 'ucum-list';

  public query = new UcumSearchParams();
  public searchResult: SearchResult<Ucum> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public constructor(
    private UcumService: UcumService,
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

  private search(): Observable<SearchResult<Ucum>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput || undefined;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.UcumService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<Ucum>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };
}
