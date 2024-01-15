import {Component, OnInit} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {ComponentStateStore, copyDeep, LoadingManager, QueryParams, SearchResult} from '@kodality-web/core-util';
import {ChecklistLibService, ChecklistRule, ChecklistRuleSearchParams} from 'term-web/sys/_lib';

@Component({
  templateUrl: './checklist-rule-list.component.html',
})
export class ChecklistRuleListComponent implements OnInit {
  public query = new ChecklistRuleSearchParams();
  public searchResult: SearchResult<ChecklistRule> = SearchResult.empty();
  public searchInput: string;
  public loader = new LoadingManager();

  protected readonly STORE_KEY = 'checklist-rule-list';

  public constructor(
    private checklistService: ChecklistLibService,
    private stateStore: ComponentStateStore,
  ) { }

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }

    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<ChecklistRule>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('load', this.checklistService.searchRules(q));
  }

  public onSearch = (): Observable<SearchResult<ChecklistRule>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };
}
