import {Component, OnInit, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ComponentStateStore, copyDeep, DestroyService, QueryParams, SearchResult, AutofocusDirective} from '@termx-health/core-util';
import {MuiCardModule, MuiInputModule, MuiButtonModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiCheckboxModule, MuiNoDataModule, MuiIconModule, MuiTagModule} from '@termx-health/ui';
import {MarinaUtilModule} from '@termx-health/util';
import {finalize, Observable, tap} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';
import {InputDebounceDirective} from 'term-web/core/ui/directives/input-debounce.directive';
import {PrivilegedDirective} from 'term-web/core/auth/privileges/privileged.directive';
import {AddButtonComponent} from 'term-web/core/ui/components/add-button/add-button.component';
import {Ecosystem, EcosystemSearchParams} from 'term-web/sys/_lib/ecosystem';
import {EcosystemService} from 'term-web/sys/ecosystem/services/ecosystem.service';
import {ServerLibService, ServerSearchParams} from 'term-web/sys/_lib/space';

@Component({
  templateUrl: './ecosystem-list.component.html',
  providers: [DestroyService],
  imports: [MuiCardModule, MuiInputModule, InputDebounceDirective, AutofocusDirective, FormsModule,
    PrivilegedDirective, AddButtonComponent, RouterLink, MuiButtonModule, MuiBackendTableModule,
    MuiTableModule, MuiCoreModule, MuiCheckboxModule, MuiNoDataModule, MuiIconModule, MuiTagModule,
    TranslatePipe, MarinaUtilModule]
})
export class EcosystemListComponent implements OnInit {
  private ecosystemService = inject(EcosystemService);
  private serverService = inject(ServerLibService);
  private stateStore = inject(ComponentStateStore);

  public query = new EcosystemSearchParams();
  public searchResult: SearchResult<Ecosystem> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;
  public serverNames: {[id: number]: string} = {};

  protected readonly STORE_KEY = 'ecosystem-list';

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }
    this.loadData();
    this.loadServerNames();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<Ecosystem>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});
    this.loading = true;
    return this.ecosystemService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<Ecosystem>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  private loadServerNames(): void {
    const params = new ServerSearchParams();
    params.limit = -1;
    this.serverService.search(params).subscribe(resp => {
      resp.data.forEach(s => this.serverNames[s.id] = s.code);
    });
  }

  public getEcosystemJsonUrl(ecosystem: Ecosystem): string {
    return this.ecosystemService.getEcosystemJsonUrl(ecosystem.code);
  }

  public downloadEcosystemJson(ecosystem: Ecosystem): void {
    this.ecosystemService.downloadEcosystemJson(ecosystem.code).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecosystem-${ecosystem.code}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
