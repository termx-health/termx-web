import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {compareValues, ComponentStateStore, copyDeep, group, isDefined, LoadingManager, QueryParams, SearchResult, unique} from '@kodality-web/core-util';
import {MuiTableComponent} from '@kodality-web/marina-ui';
import {TranslateService} from '@ngx-translate/core';
import {Observable, tap} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import {CodeSystemAssociation, CodeSystemConcept, CodeSystemEntityVersion, CodeSystemLibService, ConceptSearchParams} from 'term-web/resources/_lib';


interface Filter {
  open: boolean,
  searchInput?: string,
  type: 'eq' | 'contains',

  clinicalType?: boolean,
  labType?: boolean,
  surveyType?: boolean,
  class?: string[],
  orderObs?: string,
  property?: string[],
  time?: string[],
  system?: string[],
  scale?: string[],
  method?: string[]
}

@Component({
  selector: 'tw-loinc-list',
  templateUrl: './loinc-list.component.html',
  styles: [`
    .hide-context .needle {
      transition: 0.2s ease-in;
      opacity: 1;
    }

    .hide-context:not(:hover) .needle {
      opacity: 0;
    }
  `]
})
export class LoincListComponent implements OnInit {
  protected readonly STORE_KEY = 'loinc-list';
  protected readonly TYPES = ['CLIN', 'Lab', 'Survey'];
  protected readonly TYPE_ICONS = {'CLIN': 'medicine-box', 'Lab': 'experiment', 'Survey': 'file-text'};


  // backend table
  protected query = new ConceptSearchParams();
  protected searchResult: SearchResult<CodeSystemConcept> = SearchResult.empty();
  // filter
  protected filter: Filter = {open: false, type: 'contains'};
  protected _filter: Omit<Filter, 'open'> = this.filter; // temp, use only in tw-table-filter
  protected recent: string[] = this.recentSearches();

  protected loader = new LoadingManager();
  protected parts: {[key: string]: CodeSystemConcept} = {};

  @ViewChild(MuiTableComponent) protected table?: MuiTableComponent<CodeSystemConcept>;

  public constructor(
    private codeSystemService: CodeSystemLibService,
    private translateService: TranslateService,
    private authService: AuthService,
    private router: Router,
    private stateStore: ComponentStateStore) {}

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.filter = state.filter;
    }

    this.loadData();
  }


  protected loadData(): void {
    this.search().subscribe(r => {
      this.searchResult = r;
      this.loadParts(r.data);
    });
  }

  protected onDebounced = (): Observable<SearchResult<CodeSystemConcept>> => {
    const text = this.filter.searchInput;
    this.query.offset = 0;
    return this.search().pipe(
      tap(resp => this.searchResult = resp),
      tap(() => this.addRecentSearch(text))
    );
  };


  protected onFilterOpen(): void {
    this.filter.open = true;
    this._filter = structuredClone(this.filter); // copy 'active' to 'temp'
  }

  protected onFilterSearch(): void {
    this.filter = {...structuredClone(this._filter)} as Filter; // copy 'temp' to 'active'
    this.addRecentSearch(this.filter.searchInput);

    this.query.offset = 0;
    this.loadData();
  }

  public onFilterReset(): void {
    this.filter = {open: this.filter.open, type: 'contains'};
    this._filter = structuredClone(this.filter);
  }


  // search

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    const q = copyDeep(this.query);
    if (this.filter.type === 'eq') {
      q.textEq = this.filter.searchInput;
    } else if (this.filter.type === 'contains') {
      q.textContains = this.filter.searchInput;
      q.textContainsSep = ' ';
    }
    q.propertyValues = this.getPropertyValues(this.filter);

    this.stateStore.put(this.STORE_KEY, {query: this.query, filter: this.filter});
    return this.loader.wrap('search', this.codeSystemService.searchConcepts('loinc', q));
  }

  private loadParts(concepts: CodeSystemConcept[]): void {
    const properties = concepts.map(c => this.getLastVersion(c.versions)).filter(v => isDefined(v)).flatMap(v => v.propertyValues);
    const partCodes = properties?.map(p => p?.value?.code).filter(c => isDefined(c)).filter(unique);
    if (!partCodes || partCodes.length === 0) {
      return;
    }
    const params = new ConceptSearchParams();
    params.code = partCodes.join(',');
    params.limit = -1;
    this.loader.wrap('parts', this.codeSystemService.searchConcepts('loinc-part', params)).subscribe(r => {
      this.parts = group(r.data, c => c.code, c => c);
    });
  }


  // properties

  private getPropertyValues(filter: Filter): string {
    const propertyValues = [];
    this.addPropertyParams(propertyValues, 'CLASS', [
      ...(filter.class || []),
      filter.clinicalType ? 'LP7787-7' : undefined,
      filter.labType ? 'LP29693-6' : undefined,
      filter.surveyType ? 'LP29696-9' : undefined]);
    this.addPropertyParams(propertyValues, 'ORDER_OBS', [filter.orderObs]);
    this.addPropertyParams(propertyValues, 'TIME', filter.time);
    this.addPropertyParams(propertyValues, 'SCALE', filter.scale);
    this.addPropertyParams(propertyValues, 'METHOD', filter.method);
    this.addPropertyParams(propertyValues, 'SYSTEM', filter.system);
    this.addPropertyParams(propertyValues, 'PROPERTY', filter.property);
    return propertyValues.length > 0 ? propertyValues.join(';') : undefined;
  }

  private addPropertyParams(propertyValues: string[], type: string, values: string[]): void {
    values = values?.filter(v => isDefined(v));
    if (values?.length > 0) {
      propertyValues.push(type + '|' + values.join(','));
    }
  }


  // events

  protected openConcept(code: string): void {
    const canEdit = this.authService.hasPrivilege('loinc.CodeSystem.edit');
    const path = `/resources/code-systems/loinc/concepts/${code}${canEdit ? '/edit' : '/view'}`;
    this.router.navigate([path]);
  }

  protected showAssociations(c: CodeSystemConcept, i: number): void {
    if (c['_expanded']) {
      this.table.collapse(i);
    } else {
      this.table.expand(i);
    }
    c['_expanded'] = !c['_expanded'];
  }


  // utils

  protected isFilterSelected(filter: Filter): boolean {
    const exclude: (keyof Filter)[] = ['open', 'searchInput', 'type'];
    return Object.keys(filter)
      .filter((k: keyof Filter) => !exclude.includes(k))
      .some(k => Array.isArray(filter[k]) ? !!filter[k].length : isDefined(filter[k]))
  }

  protected getName = (c: CodeSystemConcept, type = 'display'): string => {
    const lang = this.translateService.currentLang;
    const version = this.getLastVersion(c?.versions);
    const displays = version?.designations?.filter(d => d.designationType === type).sort((d1, d2) => d1.language === lang ? 0 : 1);
    return displays?.length > 0 ? displays[0]?.name : '';
  };

  protected getPartName = (c: CodeSystemConcept, partType: string, parts: {[key: string]: CodeSystemConcept}): string[] => {
    const property = partType === 'TYPE' ? 'CLASS' : partType;

    const version = this.getLastVersion(c?.versions);
    const properties = version?.propertyValues?.filter(pv => pv.entityProperty === property);
    return properties?.map(p => {
      const part = parts[p.value?.code];
      const name = this.getName(part, 'alias');
      if (partType === 'CLASS' && this.TYPES.includes(name) || partType === 'TYPE' && !this.TYPES.includes(name)) {
        return undefined;
      }
      return name;
    }).filter(n => isDefined(n));
  };

  protected getPropName = (c: CodeSystemConcept, prop: string): string[] => {
    const version = this.getLastVersion(c?.versions);
    const properties = version?.propertyValues?.filter(pv => pv.entityProperty === prop);
    return properties?.map(p => p.value).filter(n => isDefined(n));
  };

  protected getAssociations = (c: CodeSystemConcept): CodeSystemAssociation[] => {
    const version = this.getLastVersion(c?.versions);
    return version?.associations;
  };

  protected getIconCode = (type: string): string => {
    return this.TYPE_ICONS[type];
  };

  private getLastVersion = (versions: CodeSystemEntityVersion[]): CodeSystemEntityVersion => {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  };


  // recent searches

  private recentSearches(): string[] {
    try {
      return JSON.parse(sessionStorage.getItem('__tw-loinc-list-search#' + this.authService.user.username) || '[]');
    } catch (e) {
      return [];
    }
  }

  private addRecentSearch(token: string): void {
    this.recent = [token, ...this.recent].map(t => t?.trim()).filter(Boolean).filter(unique);
    sessionStorage.setItem('__tw-loinc-list-search#' + this.authService.user.username, JSON.stringify(this.recent));
  }

  protected clearRecentSearches(): void {
    this.recent = [];
    sessionStorage.removeItem('__tw-loinc-list-search#' + this.authService.user.username);
  }
}
