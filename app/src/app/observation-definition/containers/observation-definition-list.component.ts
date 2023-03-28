import {Component, OnInit} from '@angular/core';
import {ComponentStateStore, copyDeep, LoadingManager, QueryParams, SearchResult} from '@kodality-web/core-util';
import {ObservationDefinitionService} from '../services/observation-definition.service';
import {ObservationDefinition, ObservationDefinitionSearchParams} from 'app/src/app/observation-definition/_lib';
import {debounceTime, distinctUntilChanged, Observable, Subject, switchMap, tap} from 'rxjs';

@Component({
  templateUrl: 'observation-definition-list.component.html'
})
export class ObservationDefinitionListComponent implements OnInit {
  private readonly STORE_KEY = 'observation-definition-list';

  protected searchInput?: string;
  protected searchResult = SearchResult.empty<ObservationDefinition>();
  protected query = new ObservationDefinitionSearchParams();
  protected loader = new LoadingManager();
  public searchUpdate = new Subject<string>();

  public constructor(
    private observationDefinitionService: ObservationDefinitionService,
    private stateStore: ComponentStateStore
  ) { }

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }

    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      tap(() => this.query.offset = 0),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  private loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  protected search(): Observable<SearchResult<ObservationDefinition>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput || undefined;
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('load', this.observationDefinitionService.search(q));
  }
}
