import { Component, OnInit, inject } from '@angular/core';
import { ComponentStateStore, copyDeep, LoadingManager, QueryParams, SearchResult, AutofocusDirective, LocalDatePipe } from '@kodality-web/core-util';
import {Observable, tap} from 'rxjs';
import {Release, ReleaseLibService, ReleaseSearchParams} from 'term-web/sys/_lib';
import { MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiNoDataModule } from '@kodality-web/marina-ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';

import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';

@Component({
    templateUrl: './release-list.component.html',
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
    StatusTagComponent,
    MuiNoDataModule,
    TranslatePipe,
    MarinaUtilModule,
    LocalDatePipe
],
})
export class ReleaseListComponent implements OnInit {
  private releaseService = inject(ReleaseLibService);
  private stateStore = inject(ComponentStateStore);

  public query = new ReleaseSearchParams();
  public searchResult: SearchResult<Release> = SearchResult.empty();
  public searchInput: string;
  public loader = new LoadingManager();

  protected readonly STORE_KEY = 'release-list';

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

  private search(): Observable<SearchResult<Release>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('load', this.releaseService.search(q));
  }

  public onSearch = (): Observable<SearchResult<Release>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };
}
