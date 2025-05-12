import { Component, OnInit } from '@angular/core';
import { UcumLibService, Prefix} from 'term-web/ucum/_lib';
import { finalize } from 'rxjs/operators';
import { ComponentStateStore, QueryParams, SearchResult } from '@kodality-web/core-util';

@Component({
  templateUrl: './prefix-list.component.html',
})
export class PrefixListComponent implements OnInit {
  public query = new QueryParams();
  public searchResult: SearchResult<Prefix> = SearchResult.empty();
  public loading = false;

  private readonly STORE_KEY = 'prefix-list';
  private allPrefixes: Prefix[] = [];

  public constructor(
    private ucumSvc: UcumLibService,
    private stateStore: ComponentStateStore
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state?.allPrefixes) {
      this.allPrefixes = state.allPrefixes;
      if (state.query) {
        this.query = state.query;
      }
      this.applyQuery();
    } else {
      this.loading = true;
      this.ucumSvc.loadPrefixes().pipe(finalize(() => this.loading = false))
        .subscribe(prefixes => {
          this.allPrefixes = prefixes;
          this.stateStore.put(this.STORE_KEY, { allPrefixes: prefixes, query: this.query });
          this.applyQuery();
        });
    }
  }

  public loadData(): void {
    this.stateStore.put(this.STORE_KEY, { allPrefixes: this.allPrefixes, query: this.query });
    this.applyQuery();
  }

  private applyQuery(): void {
    const offset = this.query.offset ?? 0;
    const limit = this.query.limit > 0 ? this.query.limit : this.allPrefixes.length;
    const page = this.allPrefixes.slice(offset, offset + limit);

    const sr = new SearchResult<Prefix>();
    sr.data = page;
    sr.meta = {
      total: this.allPrefixes.length,
      pages: limit > 0 ? Math.ceil(this.allPrefixes.length / limit) : 1,
      offset: offset
    };

    this.searchResult = sr;
  }
}