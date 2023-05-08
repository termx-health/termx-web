import {Component, OnInit} from '@angular/core';
import {finalize, Observable, tap} from 'rxjs';
import {ComponentStateStore, copyDeep, QueryParams, SearchResult} from '@kodality-web/core-util';
import {SequenceSearchParams} from 'term-web/sequence/_lib/models/sequence-search-params';
import {Sequence} from 'term-web/sequence/_lib/models/sequence';
import {SequenceLibService} from 'term-web/sequence/_lib/services/sequence-lib.service';


@Component({
  templateUrl: 'sequence-list.component.html'
})
export class SequenceListComponent implements OnInit {
  protected readonly STORE_KEY = 'sequence-list';

  public query: SequenceSearchParams;
  public searchResult: SearchResult<Sequence> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public constructor(
    private sequenceService: SequenceLibService,
    private stateStore: ComponentStateStore
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    } else {
      this.query = new SequenceSearchParams();
      this.query.sort = 'code';
    }

    this.loadData();
  }

  private search(): Observable<SearchResult<Sequence>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.sequenceService.search(q).pipe(finalize(() => this.loading = false));
  }

  protected onSearch = (): Observable<SearchResult<Sequence>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }
}
