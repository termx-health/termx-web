import { Component, OnInit } from '@angular/core';
import { UcumComponentsLibService, DefinedUnit } from 'term-web/ucum/_lib';
import { finalize } from 'rxjs/operators';
import { SearchResult } from '@kodality-web/core-util';
import { ComponentStateStore } from '@kodality-web/core-util';
import {SearchParams} from "../../../_lib";

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
    private ucumCmpSvc: UcumComponentsLibService,
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
    let filtered = this.allUnits;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.code.toLowerCase().includes(term) ||
        u.names?.some(n => n.toLowerCase().includes(term))
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
    } as SearchResult<DefinedUnit>;
  }

  public onSearchTermChange(): void {
    this.query.offset = 0;
    this.loadData();
  }
}