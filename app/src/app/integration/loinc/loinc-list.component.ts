import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {compareValues, ComponentStateStore, copyDeep, group, isDefined, LoadingManager, QueryParams, SearchResult, unique} from '@kodality-web/core-util';
import {CodeSystemAssociation, CodeSystemConcept, CodeSystemEntityVersion, CodeSystemLibService, ConceptSearchParams} from 'term-web/resources/_lib';
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from 'term-web/core/auth';
import {Router} from '@angular/router';
import {MuiTableComponent} from '@kodality-web/marina-ui';


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


  // quick search
  protected searchInput: {input?: string, type: 'eq' | 'contains'} = {type: 'contains'};
  protected searchOptions: string[] = this.recentSearches();
  // backend table
  protected query = new ConceptSearchParams();
  protected searchResult: SearchResult<CodeSystemConcept> = SearchResult.empty();
  // filter
  protected filter: any = {}; // get values from temp filter when 'Search' button is clicked
  protected _filter: any = {}; // temp filter
  protected isFilterOpen = false;

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
      this.searchInput = state.searchInput;
      this.query = Object.assign(new QueryParams(), state.query);
      this.filter = state.filter;
      this._filter = state.filter;
      this.isFilterOpen = state.isFilterOpen;
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
    const text = this.searchInput.input;
    this.query.offset = 0;
    return this.search().pipe(
      tap(resp => this.searchResult = resp),
      tap(() => this.addRecentSearch(text))
    );
  };

  protected onFilterSearch = (): void => {
    this.query.offset = 0;

    this.filter = structuredClone(this._filter);
    this.loadData();
  };

  public onFilterReset(): void {
    this._filter = {};
  }

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput.type === 'contains' ? this.searchInput.input : undefined;
    q.textContainsSep = ' ';
    q.textEq = this.searchInput.type === 'eq' ? this.searchInput.input : undefined;
    q.propertyValues = this.getPropertyValues(this.filter);

    this.stateStore.put(this.STORE_KEY, {query: this.query, searchInput: this.searchInput, filter: this.filter, isFilterOpen: this.isFilterOpen});
    return this.loader.wrap('search', this.codeSystemService.searchConcepts('loinc', q));
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

  private getLastVersion(versions: CodeSystemEntityVersion[]): CodeSystemEntityVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
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


  private getPropertyValues(filter: any): string {
    let propertyValues = [];
    this.addPropertyParams(propertyValues, 'CLASS', [...(filter.class || []),
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


  protected openConcept(code: string): void {
    const canEdit = this.authService.hasPrivilege('loinc.CodeSystem.edit');
    const path = '/resources/code-systems/loinc/concepts/' + code + (canEdit ? '/edit' : '/view');
    this.router.navigate([path]);
  }

  private addPropertyParams(propertyValues: string[], type: string, values: string[]): void {
    values = values?.filter(v => isDefined(v));
    if (values?.length > 0) {
      propertyValues.push(type + '|' + values.join(','));
    }
  }

  protected showAssociations(c: CodeSystemConcept, i: number): void {
    if (c['_expanded']) {
      this.table.collapse(i);
    } else {
      this.table.expand(i);
    }
    c['_expanded'] = !c['_expanded'];
  }


  private recentSearches(): string[] {
    try {
      return JSON.parse(localStorage.getItem('__tw-loinc-list-search#' + this.authService.user.username) || '[]');
    } catch (e) {
      return [];
    }
  }

  private addRecentSearch(token: string): void {
    this.searchOptions = [token, ...this.searchOptions].map(t => t.trim()).filter(Boolean).filter(unique);
    localStorage.setItem('__tw-loinc-list-search#' + this.authService.user.username, JSON.stringify(this.searchOptions))
  }

  protected clearRecentSearches(): void {
    this.searchOptions = [];
    localStorage.removeItem('__tw-loinc-list-search#' + this.authService.user.username);
  }
}
