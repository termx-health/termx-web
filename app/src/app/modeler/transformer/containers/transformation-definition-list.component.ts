import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ComponentStateStore, copyDeep, LoadingManager, QueryParams, SearchResult} from '@kodality-web/core-util';
import {Observable, tap} from 'rxjs';
import {TransformationDefinition} from '../../_lib/transformer/transformation-definition';
import {TransformationDefinitionQueryParams} from '../../_lib/transformer/transformation-definition-query.params';
import {TransformationDefinitionService} from '../services/transformation-definition.service';

@Component({
  templateUrl: './transformation-definition-list.component.html',
})
export class TransformationDefinitionListComponent implements OnInit {
  protected readonly STORE_KEY = 'transformation-definition-list';

  protected query = new TransformationDefinitionQueryParams();
  protected searchResult = SearchResult.empty<TransformationDefinition>();
  protected loader = new LoadingManager();

  public constructor(
    private transformationDefinitionService: TransformationDefinitionService,
    private stateStore: ComponentStateStore,
    private router: Router,
  ) {
    this.query.summary = true;
    this.query.sort = 'id';
  }

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
    }

    this.loadData();
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<TransformationDefinition>> {
    const q = copyDeep(this.query);
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('search', this.transformationDefinitionService.search(q));
  }

  protected onSearch = (): Observable<SearchResult<TransformationDefinition>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected duplicateDefinition(id: number): void {
    this.loader.wrap('duplicate', this.transformationDefinitionService.duplicate(id)).subscribe(td => {
      this.router.navigate(['/modeler/transformation-definitions', td.id, 'edit']);
    });
  }
}
