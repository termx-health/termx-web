import { Component, OnInit } from '@angular/core';
import { UcumComponentsLibService, BaseUnit } from 'term-web/ucum/_lib';
import { finalize } from 'rxjs/operators';
import { ComponentStateStore, QueryParams, SearchResult } from '@kodality-web/core-util';
import {SearchParams} from "../../../_lib";

@Component({
  templateUrl: './base-unit-list.component.html',
})
export class BaseUnitListComponent implements OnInit {
  public query = new SearchParams();
  public searchResult: SearchResult<BaseUnit> = SearchResult.empty();
  public loading = false;
  public searchTerm = '';
  private allBaseUnits: BaseUnit[] = [];

  private readonly STORE_KEY = 'base-unit-list';

  public constructor(
    private ucumCmpSvc: UcumComponentsLibService,
    private stateStore: ComponentStateStore
  ) {}

  public ngOnInit(): void {
    const savedBaseUnits = this.stateStore.pop(this.STORE_KEY);
    if (Array.isArray(savedBaseUnits) && savedBaseUnits.length > 0) {
      this.allBaseUnits = savedBaseUnits as BaseUnit[];
      this.loadData();
      return;
    }
    this.loading = true;
    this.ucumCmpSvc.loadBaseUnits()
      .pipe(finalize(() => this.loading = false))
      .subscribe(baseUnits => {
        this.allBaseUnits = baseUnits;
        this.stateStore.put(this.STORE_KEY, baseUnits);
        this.loadData();
      });
  }

  public loadData(): void {
    let filtered = this.allBaseUnits;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(bu =>
        bu.code.toLowerCase().includes(term) ||
        bu.names?.some(n => n.toLowerCase().includes(term))
      );
    }
    const offset = this.query.offset ?? 0;
    const limit = this.query.limit > 0 ? this.query.limit : filtered.length;
    const page = filtered.slice(offset, offset + limit);
    this.searchResult = {
      data: page,
      meta: {
        total: filtered.length,
        pages: limit > 0 ? Math.ceil(filtered.length / limit) : 1,
        offset,
      },
    } as SearchResult<BaseUnit>;
  }

  public onSearchTermChange(): void {
    this.query.offset = 0;
    this.loadData();
  }
}