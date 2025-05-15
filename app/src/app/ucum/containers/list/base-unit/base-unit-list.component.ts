import { Component, OnInit } from '@angular/core';
import { UcumComponentsLibService, BaseUnit } from 'term-web/ucum/_lib';
import { finalize } from 'rxjs/operators';
import { ComponentStateStore, QueryParams, SearchResult } from '@kodality-web/core-util';

@Component({
  templateUrl: './base-unit-list.component.html',
})
export class BaseUnitListComponent implements OnInit {
  public query = new QueryParams();
  public searchResult: SearchResult<BaseUnit> = SearchResult.empty();
  public loading = false;

  private readonly STORE_KEY = 'base-unit-list';
  private allBaseUnits: BaseUnit[] = [];

  public constructor(
    private ucumCmpSvc: UcumComponentsLibService,
    private stateStore: ComponentStateStore
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state?.allBaseUnits) {
      this.allBaseUnits = state.allBaseUnits;
      if (state.query) {
        this.query = state.query;
      }
      this.applyQuery();
    } else {
      this.loading = true;
      this.ucumCmpSvc.loadBaseUnits().pipe(finalize(() => this.loading = false))
        .subscribe(baseUnits => {
          this.allBaseUnits = baseUnits;
          this.stateStore.put(this.STORE_KEY, { allBaseUnits: baseUnits, query: this.query });
          this.applyQuery();
        });
    }
  }

  public loadData(): void {
    this.stateStore.put(this.STORE_KEY, { allBaseUnits: this.allBaseUnits, query: this.query });
    this.applyQuery();
  }

  private applyQuery(): void {
    const offset = this.query.offset ?? 0;
    const limit = this.query.limit > 0 ? this.query.limit : this.allBaseUnits.length;
    const page = this.allBaseUnits.slice(offset, offset + limit);

    const sr = new SearchResult<BaseUnit>();
    sr.data = page;
    sr.meta = {
      total: this.allBaseUnits.length,
      pages: limit > 0 ? Math.ceil(this.allBaseUnits.length / limit) : 1,
      offset: offset
    };

    this.searchResult = sr;
  }
}