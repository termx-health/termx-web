import {Component, OnInit} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {compareValues, ComponentStateStore, copyDeep, group, isDefined, LoadingManager, QueryParams, SearchResult} from '@kodality-web/core-util';
import {CodeSystemConcept, CodeSystemEntityVersion, CodeSystemLibService, ConceptSearchParams} from 'term-web/resources/_lib';
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from 'term-web/core/auth';
import {Router} from '@angular/router';

@Component({
  selector: 'tw-loinc-list',
  templateUrl: './loinc-list.component.html',
})
export class LoincListComponent implements OnInit {
  protected readonly STORE_KEY = 'loinc-list';
  protected readonly TYPES = ['CLIN', 'Lab', 'Survey'];
  protected readonly TYPE_ICONS = {'CLIN': 'medicine-box', 'Lab': 'experiment', 'Survey': 'file-text'};

  protected query = new ConceptSearchParams();
  protected searchResult: SearchResult<CodeSystemConcept> = SearchResult.empty();
  protected searchInput: string;
  protected isFilterOpen = false;
  protected filter: any = {};
  protected loader = new LoadingManager();

  protected parts: {[key: string]: CodeSystemConcept} = {};

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
      this.searchInput = this.query.textContains;
    }

    this.loadData();
  }

  protected loadData(): void {
    this.search().subscribe(r => {
      this.searchResult = r;
      this.loadParts(r.data);
    });
  }

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    q.propertyValues = this.getPropertyValues(this.filter);
    this.stateStore.put(this.STORE_KEY, {query: q});
    return this.loader.wrap('search', this.codeSystemService.searchConcepts('loinc', q));
  }

  public onSearch = (): Observable<SearchResult<CodeSystemConcept>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };


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

  protected getIconCode = (type: string): string => {
    return this.TYPE_ICONS[type];
  };

  private getLastVersion(versions: CodeSystemEntityVersion[]): CodeSystemEntityVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  }

  private loadParts(concepts: CodeSystemConcept[]): void {
    const properties = concepts.map(c => this.getLastVersion(c.versions)).filter(v => isDefined(v)).flatMap(v => v.propertyValues);
    const partCodes = properties?.map(p => p?.value?.code).filter(c => isDefined(c));
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

  public reset(): void {
    this.filter = {};
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
    const canEdit = this.authService.hasPrivilege('*.CodeSystem.edit');
    const path = 'resources/code-systems/loinc/concepts/' + code + (canEdit ? '/edit' : '/view');
    this.router.navigate([path]);
  }

  private addPropertyParams(propertyValues: string[], type: string, values: string[]): void {
    values = values?.filter(v => isDefined(v));
    if (values?.length > 0) {
      propertyValues.push(type + '|' + values.join(','));
    }
  }
}
