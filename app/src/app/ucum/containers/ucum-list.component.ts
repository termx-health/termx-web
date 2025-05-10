import { Component, OnInit } from '@angular/core';
import { UcumLibService, DefinedUnit } from 'term-web/ucum/_lib';
import { finalize } from 'rxjs/operators';
import {QueryParams, SearchResult} from "@kodality-web/core-util";

@Component({
  templateUrl: './ucum-list.component.html',
})
export class UcumListComponent implements OnInit {
  public query = new QueryParams();
  public searchResult: SearchResult<DefinedUnit> = SearchResult.empty();
  public loading = false;

  public constructor(private ucumSvc: UcumLibService) {}

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.loading = true;
    this.ucumSvc.loadDefinedUnitsAsSearchResult(this.query)
      .pipe(finalize(() => this.loading = false))
      .subscribe(sr => this.searchResult = sr);
  }
}