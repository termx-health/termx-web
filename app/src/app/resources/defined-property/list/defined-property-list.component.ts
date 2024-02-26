import {Component, OnInit} from '@angular/core';
import {ComponentStateStore, copyDeep, DestroyService, LoadingManager, QueryParams, SearchResult} from '@kodality-web/core-util';
import {Observable, tap} from 'rxjs';
import {DefinedProperty, DefinedPropertySearchParams} from 'term-web/resources/_lib';
import {DefinedPropertyLibService} from 'term-web/resources/_lib/defined-property/services/defined-property-lib.service';

@Component({
  templateUrl: './defined-property-list.component.html',
  providers: [DestroyService]
})
export class DefinedPropertyListComponent implements OnInit {
  protected query = new DefinedPropertySearchParams();
  protected searchResult: SearchResult<DefinedProperty> = SearchResult.empty();
  protected searchInput: string;
  protected loader = new LoadingManager();

  protected readonly STORE_KEY = 'defined-entity-property-list';

  public constructor(
    private definedEntityPropertyService: DefinedPropertyLibService,
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

  private search(): Observable<SearchResult<DefinedProperty>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('load', this.definedEntityPropertyService.search(q));
  }

  protected onSearch = (): Observable<SearchResult<DefinedProperty>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };
}
