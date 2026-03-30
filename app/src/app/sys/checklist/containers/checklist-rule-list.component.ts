import { Component, OnInit, inject } from '@angular/core';
import { ComponentStateStore, copyDeep, LoadingManager, QueryParams, SearchResult, AutofocusDirective } from '@termx-health/core-util';
import {Observable, tap} from 'rxjs';
import {ChecklistLibService, ChecklistRule, ChecklistRuleSearchParams} from 'term-web/sys/_lib';
import { MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiCheckboxModule, MuiNoDataModule } from '@termx-health/ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@termx-health/util';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';

@Component({
    templateUrl: './checklist-rule-list.component.html',
    imports: [
    MuiCardModule,
    MuiInputModule,
    InputDebounceDirective,
    AutofocusDirective,
    FormsModule,
    PrivilegedDirective,
    AddButtonComponent,
    RouterLink,
    MuiBackendTableModule,
    MuiTableModule,
    MuiCoreModule,
    MuiCheckboxModule,
    MuiNoDataModule,
    TranslatePipe,
    MarinaUtilModule,
    HasAnyPrivilegePipe
],
})
export class ChecklistRuleListComponent implements OnInit {
  private checklistService = inject(ChecklistLibService);
  private stateStore = inject(ComponentStateStore);

  public query = new ChecklistRuleSearchParams();
  public searchResult: SearchResult<ChecklistRule> = SearchResult.empty();
  public searchInput: string;
  public loader = new LoadingManager();

  protected readonly STORE_KEY = 'checklist-rule-list';

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
