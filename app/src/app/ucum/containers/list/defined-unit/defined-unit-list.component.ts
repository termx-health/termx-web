import { Component, OnInit } from '@angular/core';
import { UcumLibService, DefinedUnit, SearchParams } from 'term-web/ucum/_lib';
import { finalize } from 'rxjs/operators';
import { SearchResult } from '@kodality-web/core-util';
import { ComponentStateStore } from '@kodality-web/core-util';
import {applyPagination, applySort} from "term-web/ucum/utils/table-util";

@Component({
  templateUrl: './defined-unit-list.component.html',
})
export class DefinedUnitListComponent implements OnInit {
  public query = new SearchParams();
  public searchResult: SearchResult<DefinedUnit> = SearchResult.empty();
  public loading = false;
  public searchTerm = '';
  private allUnits: DefinedUnit[] = [];

  private readonly STORE_KEY = 'defined-unit-list';

  public constructor(
    private ucumCmpSvc: UcumLibService,
    private stateStore: ComponentStateStore
  ) {}

  public ngOnInit(): void {
    const savedUnits = this.stateStore.pop(this.STORE_KEY);
    if (Array.isArray(savedUnits) && savedUnits.length > 0) {
      this.allUnits = savedUnits as DefinedUnit[];
      this.loadData();
      return;
    }
    this.loading = true;
    this.ucumCmpSvc.loadDefinedUnits()
      .pipe(finalize(() => this.loading = false))
      .subscribe(units => {
        this.allUnits = units;
        this.stateStore.put(this.STORE_KEY, units);
        this.loadData();
      });
  }

  public loadData(): void {
    let filtered = [...this.allUnits];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.code.toLowerCase().includes(term) ||
        u.names?.some(n => n.toLowerCase().includes(term))
      );
    }
    filtered = applySort(filtered, this.query.sort);

    const { data: page, meta } = applyPagination(filtered, this.query);
    this.searchResult = { data: page, meta} as SearchResult<DefinedUnit>;
  }

  public onSearchTermChange(): void {
    this.query.offset = 0;
    this.loadData();
  }
}