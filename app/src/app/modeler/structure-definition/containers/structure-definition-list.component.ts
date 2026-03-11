import { Component, OnInit, inject } from '@angular/core';
import { ComponentStateStore, copyDeep, isDefined, QueryParams, SearchResult, AutofocusDirective, ApplyPipe } from '@kodality-web/core-util';
import { catchError, finalize, Observable, of, tap } from 'rxjs';
import { StructureDefinition, StructureDefinitionSearchParams } from 'term-web/modeler/_lib';
import { StructureDefinitionService } from 'term-web/modeler/structure-definition/services/structure-definition.service';
import { TableComponent } from 'term-web/core/ui/components/table-container/table.component';
import { MuiInputModule, MuiDropdownModule, MuiCoreModule, MuiButtonModule, MuiIconModule, MuiFormModule, MuiBackendTableModule, MuiTableModule, MuiPopconfirmModule, MuiNoDataModule, MuiModalModule } from '@kodality-web/marina-ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';
import { TableFilterComponent } from 'term-web/core/ui/components/table-container/table-filter.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { SpaceSelectComponent } from 'term-web/sys/_lib/space/containers/space-select.component';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { TranslatePipe } from '@ngx-translate/core';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';
import { environment } from 'environments/environment';
import { MuiNotificationService } from '@kodality-web/marina-ui';

interface Filter {
  open: boolean;
  searchInput?: string;
  name?: string;
  url?: string;
  status?: string;
  publisher?: string;
  spaceId?: number;
}

@Component({
  templateUrl: 'structure-definition-list.component.html',
  imports: [
    TableComponent,
    MuiInputModule,
    InputDebounceDirective,
    AutofocusDirective,
    FormsModule,
    PrivilegedDirective,
    MuiDropdownModule,
    AddButtonComponent,
    MuiCoreModule,
    RouterLink,
    MuiButtonModule,
    MuiIconModule,
    TableFilterComponent,
    MuiFormModule,
    ValueSetConceptSelectComponent,
    SpaceSelectComponent,
    MuiBackendTableModule,
    MuiTableModule,
    StatusTagComponent,
    MuiPopconfirmModule,
    MuiNoDataModule,
    MuiModalModule,
    TranslatePipe,
    ApplyPipe,
    HasAnyPrivilegePipe,
  ],
})
export class StructureDefinitionListComponent implements OnInit {
  private structureDefinitionService = inject(StructureDefinitionService);
  private stateStore = inject(ComponentStateStore);
  private notificationService = inject(MuiNotificationService);

  protected readonly STORE_KEY = 'structure-definition-list';

  public query = new StructureDefinitionSearchParams();
  public searchResult: SearchResult<StructureDefinition> = SearchResult.empty();
  protected filter: Filter = { open: false };
  protected _filter: Omit<Filter, 'open'> = this.filter;
  public loading: boolean;
  public importUrl: string;
  public importModalVisible: boolean;
  public importLoading: boolean;

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.filter = state.filter;
    }
    this.loadData();
  }

  protected loadData(): void {
    this.search()
      .pipe(
        catchError(err => {
          this.notificationService.error('Failed to load structure definitions', err?.error?.message || err?.message || 'Unknown error');
          return of(SearchResult.empty());
        })
      )
      .subscribe(resp => (this.searchResult = resp));
  }

  protected onDebounced = (): Observable<SearchResult<StructureDefinition>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => (this.searchResult = resp)));
  };

  protected onFilterOpen(): void {
    this.filter.open = true;
    this._filter = structuredClone(this.filter);
  }

  protected onFilterSearch(): void {
    this.filter = { ...structuredClone(this._filter) } as Filter;
    this.query.offset = 0;
    this.loadData();
  }

  protected onFilterReset(): void {
    this.filter = { open: this.filter.open };
    this._filter = structuredClone(this.filter);
  }

  private search(): Observable<SearchResult<StructureDefinition>> {
    const q = copyDeep(this.query);
    q.textContains = this.filter.searchInput || undefined;
    q.name = this.filter.name || undefined;
    q.url = this.filter.url || undefined;
    q.status = this.filter.status || undefined;
    q.publisher = this.filter.publisher || undefined;
    q.spaceId = this.filter.spaceId;
    this.stateStore.put(this.STORE_KEY, { query: q, filter: this.filter });

    this.loading = true;
    return this.structureDefinitionService.search(q).pipe(finalize(() => (this.loading = false)));
  }

  protected isFilterSelected(filter: Filter): boolean {
    const exclude: (keyof Filter)[] = ['open', 'searchInput'];
    return Object.keys(filter)
      .filter((k: keyof Filter) => !exclude.includes(k))
      .some(k => (Array.isArray(filter[k]) ? !!filter[k].length : isDefined(filter[k])));
  }

  public openImportModal(): void {
    this.importUrl = '';
    this.importModalVisible = true;
  }

  public doImport(): void {
    if (!this.importUrl?.trim()) return;
    this.importLoading = true;
    this.structureDefinitionService
      .import({ url: this.importUrl.trim() })
      .pipe(
        finalize(() => ((this.importLoading = false), (this.importModalVisible = false))),
        catchError(err => {
          this.notificationService.error('Import failed', err?.error?.message || err?.message || 'Unknown error');
          return of(null);
        })
      )
      .subscribe(res => res && this.loadData());
  }

  public deleteStructureDefinition(id: number): void {
    this.structureDefinitionService
      .delete(id)
      .pipe(
        catchError(err => {
          this.notificationService.error('Delete failed', err?.error?.message || err?.message || 'Unknown error');
          return of(undefined);
        })
      )
      .subscribe(() => this.loadData());
  }

  protected fhirUrl(id: number): string {
    return `${window.location.origin}${environment.baseHref}fhir/StructureDefinition/${id}`;
  }
}
