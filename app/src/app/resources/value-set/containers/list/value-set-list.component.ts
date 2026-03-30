import { Component, OnInit, inject } from '@angular/core';
import { SpaceSelectComponent } from 'term-web/sys/_lib/space/containers/space-select.component';
import { ComponentStateStore, copyDeep, isDefined, QueryParams, SearchResult, sortFn, AutofocusDirective, ApplyPipe, LocalDatePipe } from '@termx-health/core-util';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {ValueSet, ValueSetSearchParams, ValueSetVersion} from 'term-web/resources/_lib';
import {environment} from 'environments/environment';
import {finalize, Observable, tap} from 'rxjs';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';
import { TableComponent } from 'term-web/core/ui/components/table-container/table.component';
import { AsyncPipe } from '@angular/common';
import { MuiInputModule, MuiDropdownModule, MuiCoreModule, MuiButtonModule, MuiIconModule, MuiFormModule, MuiBackendTableModule, MuiTableModule, MuiPopconfirmModule, MuiDividerModule, MuiNoDataModule } from '@termx-health/ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';
import { TableFilterComponent } from 'term-web/core/ui/components/table-container/table-filter.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { ResourceFhirImportModalComponent } from 'term-web/resources/resource/components/resource-fhir-import-modal-component';
import { MarinaUtilModule } from '@termx-health/util';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

interface Filter {
  open: boolean,
  searchInput?: string,
  publisher?: string,
  status?: string,
  spaceId?: number,
}

@Component({
    selector: 'tw-value-set-list',
    templateUrl: 'value-set-list.component.html',
    imports: [SpaceSelectComponent, TableComponent,
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
    MuiBackendTableModule,
    MuiTableModule,
    StatusTagComponent,
    MuiPopconfirmModule,
    MuiDividerModule,
    MuiNoDataModule,
    ResourceFhirImportModalComponent,
    AsyncPipe,
    TranslatePipe,
    MarinaUtilModule,
    ApplyPipe,
    LocalDatePipe,
    LocalizedConceptNamePipe
],
})
export class ValueSetListComponent implements OnInit {
  private valueSetService = inject(ValueSetService);
  private translateService = inject(TranslateService);
  private stateStore = inject(ComponentStateStore);

  protected readonly STORE_KEY = 'value-set-list';

  public query = new ValueSetSearchParams();
  public searchResult: SearchResult<ValueSet> = SearchResult.empty();
  protected filter: Filter = {open: false};
  protected _filter: Omit<Filter, 'open'> = this.filter; // temp, use only in tw-table-filter
  public loading: boolean;

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

  protected onDebounced = (): Observable<SearchResult<ValueSet>> => {
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

  private search(): Observable<SearchResult<ValueSet>> {
    const q = copyDeep(this.query);
    q.lang = this.translateService.currentLang;
    q.decorated = true;
    q.textContains = this.filter.searchInput || undefined;
    q.publisher = this.filter.publisher || undefined;
    q.versionStatus = this.filter.status || undefined;
    q.spaceId = this.filter.spaceId;
    this.stateStore.put(this.STORE_KEY, {query: q, filter: this.filter});

    this.loading = true;
    return this.valueSetService.search(q).pipe(finalize(() => this.loading = false));
  }


  // events

  protected deleteValueSet(valueSetId: string): void {
    this.valueSetService.deleteValueSet(valueSetId).subscribe(() => this.loadData());
  }

  protected openFhir(id: string): void {
    window.open(`${window.location.origin + environment.baseHref}fhir/ValueSet/${id}`, '_blank');
  }


  // utils

  protected isFilterSelected(filter: Filter): boolean {
    const exclude: (keyof Filter)[] = ['open', 'searchInput'];
    return Object.keys(filter)
      .filter((k: keyof Filter) => !exclude.includes(k))
      .some(k => Array.isArray(filter[k]) ? !!filter[k].length : isDefined(filter[k]));
  }

  protected getVersionTranslateTokens = (version: ValueSetVersion, translateOptions: object): string[] => {
    const tokens = [
      version.releaseDate ? 'web.value-set.list.versions-release-date' : '',
      version.expirationDate ? 'web.value-set.list.versions-expiration-date' : '',
      version.version ? 'web.value-set.list.versions-version' : ''
    ];
    return tokens.filter(Boolean).map(t => this.translateService.instant(t, translateOptions));
  };

  protected findLastVersion = (versions: ValueSetVersion[]): ValueSetVersion => {
    return versions
      ?.map(v => ({...v, created: v.created ? new Date(v.created) : undefined}))
      ?.sort(sortFn('created', false))?.[0];
  };
}
