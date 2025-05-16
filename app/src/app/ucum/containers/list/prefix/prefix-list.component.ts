import { Component, OnInit } from '@angular/core';
import { UcumComponentsLibService, Prefix} from 'term-web/ucum/_lib';
import { finalize } from 'rxjs/operators';
import { ComponentStateStore, SearchResult } from '@kodality-web/core-util';
import {SearchParams} from "../../../_lib";

@Component({
  templateUrl: './prefix-list.component.html',
})
export class PrefixListComponent implements OnInit {
  public query = new SearchParams();
  public searchResult: SearchResult<Prefix> = SearchResult.empty();
  public loading = false;
  public searchTerm = '';
  private allPrefixes: Prefix[] = [];

  private readonly STORE_KEY = 'prefix-list';

  public constructor(
    private ucumCmpSvc: UcumComponentsLibService,
    private stateStore: ComponentStateStore
  ) {}


  public ngOnInit(): void {
    const savedPrefixes = this.stateStore.pop(this.STORE_KEY);
    if (Array.isArray(savedPrefixes) && savedPrefixes.length > 0) {
      this.allPrefixes = savedPrefixes as Prefix[];
      this.loadData();
      return;
    }
    this.loading = true;
    this.ucumCmpSvc.loadPrefixes()
      .pipe(finalize(() => this.loading = false))
      .subscribe(prefixes => {
        this.allPrefixes = prefixes;
        this.stateStore.put(this.STORE_KEY, prefixes);
        this.loadData();
      });
  }

  public loadData(): void {
    let filtered = this.allPrefixes;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.code.toLowerCase().includes(term) ||
        p.names?.some(n => n.toLowerCase().includes(term))
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
    } as SearchResult<Prefix>;
  }

  public onSearchTermChange(): void {
    this.query.offset = 0;
    this.loadData();
  }
}