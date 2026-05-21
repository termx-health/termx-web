import { Component, OnInit, inject } from '@angular/core';
import { ComponentStateStore, copyDeep, DestroyService, isDefined, QueryParams, SearchResult, AutofocusDirective, ApplyPipe } from '@termx-health/core-util';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {environment} from 'environments/environment';
import {finalize, Observable, tap} from 'rxjs';
import {CodeSystem, CodeSystemSearchParams} from 'term-web/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import { TableComponent } from 'term-web/core/ui/components/table-container/table.component';
import { AsyncPipe } from '@angular/common';
import { MuiInputModule, MuiDropdownModule, MuiCoreModule, MuiButtonModule, MuiIconModule, MuiFormModule, MuiBackendTableModule, MuiTableModule, MuiPopconfirmModule, MuiNoDataModule } from '@termx-health/ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';
import { TableFilterComponent } from 'term-web/core/ui/components/table-container/table-filter.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { SpaceSelectComponent } from 'term-web/sys/_lib/space/containers/space-select.component';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { CodeSystemDuplicateModalComponent } from 'term-web/resources/code-system/containers/edit/code-system-duplicate-modal.component';
import { CodeSystemSupplementModalComponent } from 'term-web/resources/code-system/containers/edit/code-system-supplement-modal.component';
import { ResourceFhirImportModalComponent } from 'term-web/resources/resource/components/resource-fhir-import-modal-component';
import { MarinaUtilModule } from '@termx-health/util';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';
import { CodeSystemListExpandedRowComponent } from 'term-web/resources/code-system/containers/list/code-system-list-expanded-row.component';


interface Filter {
  open: boolean,
  searchInput?: string,
  publisher?: string,
  status?: string,
  spaceId?: number,
}

@Component({
    templateUrl: 'code-system-list.component.html',
    providers: [DestroyService],
    imports: [TableComponent, MuiInputModule, InputDebounceDirective, AutofocusDirective, FormsModule, PrivilegedDirective, MuiDropdownModule, AddButtonComponent, MuiCoreModule, RouterLink, MuiButtonModule, MuiIconModule, TableFilterComponent, MuiFormModule, ValueSetConceptSelectComponent, SpaceSelectComponent, MuiBackendTableModule, MuiTableModule, StatusTagComponent, MuiPopconfirmModule, MuiNoDataModule, CodeSystemDuplicateModalComponent, CodeSystemSupplementModalComponent, ResourceFhirImportModalComponent, AsyncPipe, TranslatePipe, MarinaUtilModule, ApplyPipe, LocalizedConceptNamePipe, CodeSystemListExpandedRowComponent]
})
export class CodeSystemListComponent implements OnInit {
  private codeSystemService = inject(CodeSystemService);
  private translateService = inject(TranslateService);
  private stateStore = inject(ComponentStateStore);

  protected readonly STORE_KEY = 'code-system-list';

  protected query = new CodeSystemSearchParams();
  protected searchResult: SearchResult<CodeSystem> = SearchResult.empty();
  protected filter: Filter = {open: false};
  protected _filter: Omit<Filter, 'open'> = this.filter; // temp, use only in tw-table-filter
  protected loading: boolean;

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.filter = state.filter;
    }

    this.loadData();
  }


  // searches

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  protected onDebounced = (): Observable<SearchResult<CodeSystem>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected onFilterOpen(): void {
    this.filter.open = true;
    this._filter = structuredClone(this.filter); // copy 'active' to 'temp'
  }

  protected onFilterSearch(): void {
    this.filter = {...structuredClone(this._filter)} as Filter; // copy 'temp' to 'active'
    this.query.offset = 0;
    this.loadData();
  }

  protected onFilterReset(): void {
    this.filter = {open: this.filter.open};
    this._filter = structuredClone(this.filter);
  }

  private search(): Observable<SearchResult<CodeSystem>> {
    const q = copyDeep(this.query);
    q.lang = this.translateService.currentLang;
    q.textContains = this.filter.searchInput || undefined;
    q.publisher = this.filter.publisher || undefined;
    q.versionStatus = this.filter.status || undefined;
    q.versionsDecorated = false;
    q.lastVersionDecorated = true;
    q.spaceId = this.filter.spaceId;
    this.stateStore.put(this.STORE_KEY, {query: q, filter: this.filter});

    this.loading = true;
    return this.codeSystemService.search(q).pipe(finalize(() => this.loading = false));
  }


  // events

  protected deleteCodeSystem(codeSystemId: string): void {
    this.loading = true;
    this.codeSystemService.deleteCodeSystem(codeSystemId).subscribe(() => this.loadData()).add(() => this.loading = false);
  }

  protected openFhir(id: string): void {
    window.open(`${window.location.origin + environment.baseHref}fhir/CodeSystem/${id}`, '_blank');
  }


  // utils

  protected isFilterSelected(filter: Filter): boolean {
    const exclude: (keyof Filter)[] = ['open', 'searchInput'];
    return Object.keys(filter)
      .filter((k: keyof Filter) => !exclude.includes(k))
      .some(k => Array.isArray(filter[k]) ? !!filter[k].length : isDefined(filter[k]));
  }
}
