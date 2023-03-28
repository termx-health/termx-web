import {Component, OnInit} from '@angular/core';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap} from 'rxjs';
import {ComponentStateStore, copyDeep, QueryParams, SearchResult} from '@kodality-web/core-util';
import {TerminologyServer, TerminologyServerLibService, TerminologyServerSearchParams} from 'term-web/project/_lib';

@Component({
  templateUrl: './terminology-server-list.component.html',
})
export class TerminologyServerListComponent implements OnInit {
  public query = new TerminologyServerSearchParams();
  public searchInput?: string;
  public searchUpdate = new Subject<string>();
  public searchResult: SearchResult<TerminologyServer> = SearchResult.empty();
  public loading = false;

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
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  private search(): Observable<SearchResult<TerminologyServer>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.terminologyServerService.search(q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }
}
