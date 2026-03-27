import { Component, OnInit, inject } from '@angular/core';
import { ComponentStateStore, copyDeep, QueryParams, SearchResult, AutofocusDirective } from '@kodality-web/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {Server, ServerLibService, ServerSearchParams} from 'term-web/sys/_lib/space';
import { MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiCheckboxModule, MuiNoDataModule, MuiDropdownModule, MuiButtonModule, MuiIconModule } from '@kodality-web/marina-ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';


@Component({
    templateUrl: './server-list.component.html',
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
    MuiDropdownModule,
    MuiButtonModule,
    MuiIconModule
],
})
export class ServerListComponent implements OnInit {
  private serverService = inject(ServerLibService);
  private stateStore = inject(ComponentStateStore);

  public query = new ServerSearchParams();
  public searchResult: SearchResult<Server> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  protected readonly STORE_KEY = 'server-list';

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }

    if (!this.query.limit) {
      this.query.limit = 20;
    }
    if (this.query.offset === undefined) {
      this.query.offset = 0;
    }

    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<Server>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.serverService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<Server>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  public exportEcosystem(): void {
    this.serverService.exportEcosystem().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'termx-servers.json';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  public onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const json = reader.result as string;
      this.serverService.importEcosystem(json).subscribe(() => {
        this.loadData();
      });
    };
    reader.readAsText(file);
    input.value = '';
  }
}
