import { Component, OnInit } from '@angular/core';
import { UcumLibService, BaseUnit, SearchParams } from 'term-web/ucum/_lib';
import { finalize } from 'rxjs/operators';
import { ComponentStateStore, SearchResult } from '@kodality-web/core-util';
import {applyPagination, applySort} from "term-web/ucum/utils/table-util";

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
    private ucumSvc: UcumLibService,
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
    this.ucumSvc.loadBaseUnits()
      .pipe(finalize(() => this.loading = false))
      .subscribe(baseUnits => {
        this.allBaseUnits = baseUnits;
        this.stateStore.put(this.STORE_KEY, baseUnits);
        this.loadData();
      });
  }

  public loadData(): void {
    let filtered = [...this.allBaseUnits];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(bu =>
        bu.code.toLowerCase().includes(term) ||
        bu.names?.some(n => n.toLowerCase().includes(term))
      );
    }
    filtered = applySort(filtered, this.query.sort);

    const { data: page, meta } = applyPagination(filtered, this.query);
    this.searchResult = { data: page, meta} as SearchResult<BaseUnit>;
  }

  public onSearchTermChange(): void {
    this.query.offset = 0;
    this.loadData();
  }
}