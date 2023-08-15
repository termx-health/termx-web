import {Component, OnInit} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {ComponentStateStore, copyDeep, DestroyService, LoadingManager, QueryParams, SearchResult} from '@kodality-web/core-util';
import {DefinedEntityProperty, DefinedEntityPropertySearchParams} from 'term-web/resources/_lib';
import {DefinedEntityPropertyLibService} from 'term-web/resources/_lib/definedentityproperty/services/defined-entity-property-lib.service';

@Component({
  templateUrl: './defined-entity-property-list.component.html',
  providers: [DestroyService]
})
export class DefinedEntityPropertyListComponent implements OnInit {
  protected query = new DefinedEntityPropertySearchParams();
  protected searchResult: SearchResult<DefinedEntityProperty> = SearchResult.empty();
  protected searchInput: string;
  protected loader = new LoadingManager();

  protected readonly STORE_KEY = 'defined-entity-property-list';

  public constructor(
    private definedEntityPropertyService: DefinedEntityPropertyLibService,
    private stateStore: ComponentStateStore
  ) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }
    this.loadData();
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<DefinedEntityProperty>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('load', this.definedEntityPropertyService.search(q));
  }

  protected onSearch = (): Observable<SearchResult<DefinedEntityProperty>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };
}
