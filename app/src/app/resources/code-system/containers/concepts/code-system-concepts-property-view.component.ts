import {Component, OnInit} from '@angular/core';
import {
  CodeSystem,
  CodeSystemConcept,
  CodeSystemLibService,
  CodeSystemVersion,
  ConceptSearchParams,
  Designation,
  EntityProperty,
  EntityPropertyValue
} from 'app/src/app/resources/_lib';
import {forkJoin, Observable, of} from 'rxjs';
import {copyDeep, isDefined, LoadingManager, SearchResult} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {environment} from 'environments/environment';
import {HttpClient} from '@angular/common/http';
import {AuthService} from 'term-web/core/auth';

class CodeSystemEntityPropertySummary {
  public items: CodeSystemEntityPropertySummaryItem[];
}

class CodeSystemEntityPropertySummaryItem {
  public propertyId: number;
  public propertyName: string;
  public conceptCnt: number;
  public propCnt: number;
  public propList: {code: string, codeSystem: string}[];
}

class CodeSystemEntityPropertyConceptSummary {
  public items: CodeSystemEntityPropertySummaryConceptItem[];
}

class CodeSystemEntityPropertySummaryConceptItem {
  public propertyCode: string;
  public conceptCnt: number;
  public conceptIds: number[];
}

@Component({
  templateUrl: './code-system-concepts-property-view.component.html'
})
export class CodeSystemConceptsPropertyViewComponent implements OnInit {
  protected codeSystem?: CodeSystem;
  protected versions?: CodeSystemVersion[];
  protected version?: CodeSystemVersion;

  public viewMode: boolean | string;

  protected tableView: {langs?: string[], properties?: string[]} = {};

  protected query = new ConceptSearchParams();
  protected searchResult = SearchResult.empty<CodeSystemConcept>();
  protected selectedProperty: CodeSystemEntityPropertySummaryItem;
  protected selectedPropertyValues: {propertyName: string, values: {code: string, codeSystem: string}[]}[];

  protected loader = new LoadingManager();

  protected propertySummary: CodeSystemEntityPropertySummary;
  protected propertyConceptSummary: CodeSystemEntityPropertyConceptSummary;


  public constructor(
    private router: Router,
    private route: ActivatedRoute,
    private codeSystemService: CodeSystemLibService,
    protected translateService: TranslateService,
    public http: HttpClient,
    private auth: AuthService
  ) {
    this.query.sort = 'code';
  }

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loader.wrap('load',
      forkJoin([
        this.codeSystemService.load(id),
        isDefined(versionCode) ? this.codeSystemService.loadVersion(id, versionCode) : of(undefined),
        this.codeSystemService.searchVersions(id, {limit: -1})]
      )).subscribe(([cs, version, versions]) => {
      this.codeSystem = cs;
      this.version = version;
      this.versions = versions.data;

      this.loadData();
      this.loadSummary(cs.id, version?.version);
    });
    this.viewMode = !(this.auth.hasPrivilege(id + '.CodeSystem.edit'));
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    const q = copyDeep(this.query);
    q.codeSystemVersion = this.version?.version;
    q.propertyValues = this.selectedPropertyValues?.filter(pv => pv.values?.length > 0).map(pv => pv.propertyName + '|' + pv.values.map(v => v.code).join(',')).join(';');
    return this.loader.wrap('search', this.codeSystemService.searchConcepts(this.codeSystem.id, q));
  }

  protected getConceptEditRoute = (code?: string, parentCode?: string): {path: any[], query: any} => {
    if (!code) {
      const path = `/resources/code-systems/${this.codeSystem.id}${this.version?.version ? `/versions/${this.version?.version}/concepts/add` :
        '/concepts/add'}`;
      return {path: [path], query: {parent: parentCode}};
    }

    const mode = this.viewMode ? '/view' : '/edit';
    const path = `/resources/code-systems/${this.codeSystem.id}${this.version?.version ? `/versions/${this.version?.version}/concepts/` :
      '/concepts/'}${code}${mode}`;
    return {path: [path], query: {parent: parentCode}};
  };

  protected getDesignations = (concept: CodeSystemConcept): Designation[] => {
    return concept.versions.flatMap(v => v.designations).filter(d => isDefined(d));
  };

  protected getPropertyValues = (concept: CodeSystemConcept): EntityPropertyValue[] => {
    return concept.versions.flatMap(v => v.propertyValues).filter(pv => isDefined(pv));
  };

  protected getProperty = (id: number, properties: EntityProperty[]): EntityProperty => {
    return properties?.find(p => p.id === id);
  };

  protected selectProperty(p: CodeSystemEntityPropertySummaryItem): void {
    this.selectedProperty = p;
    this.loadConceptSummary(this.codeSystem.id, this.version?.version, p.propertyId);
  }

  protected selectPropertyValue(p: {code: string, codeSystem: string}, propertyName?: string): void {
    propertyName = propertyName || this.selectedProperty.propertyName;
    if (this.valueSelected(p.code, this.selectedPropertyValues, propertyName)) {
      let pv = this.selectedPropertyValues.find(p => p.propertyName === propertyName);
      pv.values = [...pv.values.filter(v => v.code !== p.code)];
      this.selectedPropertyValues = [...this.selectedPropertyValues.filter(p => p.propertyName !== pv.propertyName), pv];
    } else {
      let pv = this.selectedPropertyValues?.find(pv => pv.propertyName === propertyName);
      if (pv) {
        pv.values = [...pv.values, {...p}];
        this.selectedPropertyValues = [...this.selectedPropertyValues.filter(p => p.propertyName !== pv.propertyName), pv];
      } else {
        this.selectedPropertyValues = [...(this.selectedPropertyValues || []), {propertyName: propertyName, values: [{...p}]}];
      }
    }
    this.loadData();
    this.loadSummary(this.codeSystem.id, this.version?.version);
    this.loadConceptSummary(this.codeSystem.id, this.version?.version, this.selectedProperty?.propertyId);
  }

  protected valueSelected = (code: string, selectedPropertyValues: {propertyName: string, values: {code: string, codeSystem: string}[]}[], propertyName?: string): boolean => {
    propertyName = propertyName || this.selectedProperty.propertyName;
    return !!selectedPropertyValues?.find(p => p.propertyName === propertyName && p.values.map(v => v.code).includes(code));
  };

  protected getConceptCnt = (code: string, conceptSummary: CodeSystemEntityPropertyConceptSummary): number => {
    return conceptSummary?.items?.find(i => i.propertyCode === code)?.conceptCnt || 0;
  };

  public loadSummary(cs: string, version: string): void {
    this.propertySummary = null;
    if (!cs) {
      return;
    }
    const epValues = this.selectedPropertyValues?.flatMap(v => v.values?.map(v => v.code))?.join(",");
    const url = `${environment.termxApi}/ts/code-systems/${cs}` +
      (isDefined(version) ? `/versions/${version}` : '') + '/entity-property-summary' +
      (isDefined(epValues) ? `?entityPropertyValues=${epValues}` : '');
    this.loader.wrap('prop', this.http.get<CodeSystemEntityPropertySummary>(url)).subscribe(r => this.propertySummary = r);
  }

  public loadConceptSummary(cs: string, version: string, pId: number): void {
    this.propertyConceptSummary = null;
    if (!cs) {
      return;
    }
    const epValues = this.selectedPropertyValues?.flatMap(v => v.values?.map(v => v.code))?.join(",");
    const url = `${environment.termxApi}/ts/code-systems/${cs}` +
      (isDefined(version) ? `/versions/${version}` : '') + `/entity-property-concept-summary?entityPropertyId=${pId}`+
      (isDefined(epValues) ? `&entityPropertyValues=${epValues}` : '');
    this.loader.wrap('prop', this.http.get<CodeSystemEntityPropertyConceptSummary>(url)).subscribe(r => this.propertyConceptSummary = r);
  }
}
