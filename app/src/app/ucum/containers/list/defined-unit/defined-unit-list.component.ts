import { Component, OnInit } from '@angular/core';
import { UcumComponentsLibService, DefinedUnit } from 'term-web/ucum/_lib';
import { finalize } from 'rxjs/operators';
import { ComponentStateStore, SearchResult } from '@kodality-web/core-util';
import {DefinedUnitSearchParams} from "../../../_lib";

@Component({
  templateUrl: './defined-unit-list.component.html',
})
export class DefinedUnitListComponent implements OnInit {
  public query = new DefinedUnitSearchParams();
  public searchResult: SearchResult<DefinedUnit> = SearchResult.empty();
  public loading = false;
  public searchTerm: string;

  private readonly STORE_KEY = 'defined-unit-list';
  private allUnits: DefinedUnit[] = [];

  public constructor(
    private ucumCmpSvc: UcumComponentsLibService,
    private stateStore: ComponentStateStore
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state?.allUnits) {
      this.allUnits = state.allUnits;
      if (state.query) {
        this.query = state.query;
      }
      if ((state as any).searchTerm) {
        this.searchTerm = (state as any).searchTerm;
      }
      this.applyQuery();
    } else {
      this.loading = true;
      this.ucumCmpSvc.loadDefinedUnits().pipe(finalize(() => this.loading = false))
        .subscribe(units => {
          this.allUnits = units;
          this.stateStore.put(this.STORE_KEY, {
            allUnits: this.allUnits,
            query: this.query,
            searchTerm: this.searchTerm
          });
          this.applyQuery();
        });
    }
  }

  public loadData(): void {
    this.stateStore.put(this.STORE_KEY, { allUnits: this.allUnits, query: this.query, searchTerm: this.searchTerm });
    this.applyQuery();
  }

  public onSearchTermChange(): void {
    this.query.searchTerm = this.searchTerm;
    this.loadData();
  }

  private applyQuery(): void {
    let filtered = this.allUnits;
    if (this.query.searchTerm) {
      const term = this.query.searchTerm.toLowerCase();
      filtered = this.allUnits.filter(u =>
        u.code.toLowerCase().includes(term) ||
        u.names?.some(n => n.toLowerCase().includes(term))
      );
    }
    const offset = this.query.offset ?? 0;
    const limit = this.query.limit > 0 ? this.query.limit : filtered.length;
    const page = filtered.slice(offset, offset + limit);

    const sr = new SearchResult<DefinedUnit>();
    sr.data = page;
    sr.meta = {
      total: filtered.length,
      pages: limit > 0 ? Math.ceil(filtered.length / limit) : 1,
      offset: offset
    };

    this.searchResult = sr;
  }
}