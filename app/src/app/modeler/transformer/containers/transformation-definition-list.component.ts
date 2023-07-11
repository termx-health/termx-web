import {Component, OnInit} from '@angular/core';
import {finalize, Observable, tap} from 'rxjs';
import {ComponentStateStore, copyDeep, QueryParams, SearchResult} from '@kodality-web/core-util';
import {TransformationDefinitionQueryParams} from '../services/transformation-definition-query.params';
import {TransformationDefinition} from '../services/transformation-definition';
import {TransformationDefinitionService} from '../services/transformation-definition.service';

@Component({
  templateUrl: './transformation-definition-list.component.html',
})
export class TransformationDefinitionListComponent implements OnInit {
  public query = new TransformationDefinitionQueryParams();
  public searchResult: SearchResult<TransformationDefinition> = SearchResult.empty();
  public loading: boolean;

  protected readonly STORE_KEY = 'transformation-definition-list';

  public constructor(
    private transformationDefinitionService: TransformationDefinitionService,
    private stateStore: ComponentStateStore,
  ) { }

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
    }

    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<TransformationDefinition>> {
    const q = copyDeep(this.query);
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.transformationDefinitionService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<TransformationDefinition>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };
}
