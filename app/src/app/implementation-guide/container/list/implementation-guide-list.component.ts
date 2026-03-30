import { Component, OnInit, inject } from '@angular/core';
import { ComponentStateStore, copyDeep, LoadingManager, QueryParams, SearchResult, AutofocusDirective, ApplyPipe, LocalDatePipe } from '@termx-health/core-util';
import {ImplementationGuide, ImplementationGuideSearchParams, ImplementationGuideVersion} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';
import {environment} from 'environments/environment';
import {Observable, tap} from 'rxjs';
import { MuiCardModule, MuiInputModule, MuiDropdownModule, MuiCoreModule, MuiBackendTableModule, MuiTableModule, MuiIconModule, MuiNoDataModule } from '@termx-health/ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@termx-health/util';


@Component({
    templateUrl: 'implementation-guide-list.component.html',
    imports: [
    MuiCardModule,
    MuiInputModule,
    InputDebounceDirective,
    AutofocusDirective,
    FormsModule,
    PrivilegedDirective,
    MuiDropdownModule,
    AddButtonComponent,
    MuiCoreModule,
    RouterLink,
    MuiBackendTableModule,
    MuiTableModule,
    MuiIconModule,
    MuiNoDataModule,
    TranslatePipe,
    MarinaUtilModule,
    ApplyPipe,
    LocalDatePipe
],
})
export class ImplementationGuideListComponent implements OnInit {
  private igService = inject(ImplementationGuideService);
  private stateStore = inject(ComponentStateStore);

  protected readonly STORE_KEY = 'ig-list';

  public query = new ImplementationGuideSearchParams();
  public searchResult: SearchResult<ImplementationGuide> = SearchResult.empty();
  public searchInput: string;
  public loader = new LoadingManager();

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

  public search(): Observable<SearchResult<ImplementationGuide>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput || undefined;
    q.decorated = true;
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('query', this.igService.search(q));
  }

  public onSearch = (): Observable<SearchResult<ImplementationGuide>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected findLastVersion = (versions: ImplementationGuideVersion[]): ImplementationGuideVersion => {
    return  versions?.sort((a, b) => new Date(a.date!) > new Date(b.date!) ? -1 : new Date(a.date!) > new Date(b.date!) ? 1 : 0)?.[0];
  };

  public delete(id: string): void {
    this.igService.delete(id).subscribe(() => this.loadData());
  }

  public openFhir(id: string): void {
    window.open(window.location.origin + environment.baseHref + 'fhir/ImplementationGuide/' + id, '_blank');
  }
}
