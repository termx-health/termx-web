import { Component, OnInit } from '@angular/core';
import { UcumLibService, DefinedUnit } from 'term-web/ucum/_lib';
import { finalize } from 'rxjs/operators';
import { ComponentStateStore, QueryParams, SearchResult } from '@kodality-web/core-util';

@Component({
  templateUrl: './defined-unit-list.component.html',
})
export class DefinedUnitListComponent implements OnInit {
  public query = new QueryParams();
  public searchResult: SearchResult<DefinedUnit> = SearchResult.empty();
  public loading = false;

  private readonly STORE_KEY = 'defined-unit-list';
  private allUnits: DefinedUnit[] = [];

  public constructor(
    private ucumSvc: UcumLibService,
    private stateStore: ComponentStateStore
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state?.allUnits) {
      this.allUnits = state.allUnits;
      if (state.query) {
        this.query = state.query;
      }
      this.applyQuery();
    } else {
      this.loading = true;
      this.ucumSvc.loadDefinedUnits().pipe(finalize(() => this.loading = false))
        .subscribe(units => {
          this.allUnits = units;
          this.stateStore.put(this.STORE_KEY, { allUnits: units, query: this.query });
          this.applyQuery();
        });
    }
  }

  public loadData(): void {
    this.stateStore.put(this.STORE_KEY, { allUnits: this.allUnits, query: this.query });
    this.applyQuery();
  }

  private applyQuery(): void {
    const offset = this.query.offset ?? 0;
    const limit = this.query.limit > 0 ? this.query.limit : this.allUnits.length;
    const page = this.allUnits.slice(offset, offset + limit);

    const sr = new SearchResult<DefinedUnit>();
    sr.data = page;
    sr.meta = {
      total: this.allUnits.length,
      pages: limit > 0 ? Math.ceil(this.allUnits.length / limit) : 1,
      offset: offset
    };

    this.searchResult = sr;
  }
}