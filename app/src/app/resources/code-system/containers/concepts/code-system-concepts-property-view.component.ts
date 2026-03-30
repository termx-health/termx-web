import {HttpClient} from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { copyDeep, isDefined, LoadingManager, SearchResult, ApplyPipe, IncludesPipe, SortPipe } from '@termx-health/core-util';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {
  CodeSystem,
  CodeSystemConcept,
  CodeSystemLibService,
  CodeSystemVersion,
  ConceptSearchParams,
  Designation,
  EntityProperty,
  EntityPropertyValue
} from 'term-web/resources/_lib';
import {environment} from 'environments/environment';
import {forkJoin, Observable, of} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule, MuiTagModule, MuiIconModule, MuiListModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiNoDataModule } from '@termx-health/ui';
import { AsyncPipe } from '@angular/common';
import { EntityPropertyValueInputComponent } from 'term-web/core/ui/components/inputs/property-value-input/entity-property-value-input.component';
import { FormsModule } from '@angular/forms';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';
import { EntityPropertyNamePipe } from 'term-web/resources/_lib/code-system/pipe/entity-propertye-name-pipe';

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
    templateUrl: './code-system-concepts-property-view.component.html',
    imports: [ResourceContextComponent, MarinPageLayoutModule, MuiTagModule, MuiIconModule, MuiListModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, RouterLink, EntityPropertyValueInputComponent, FormsModule, MuiNoDataModule, AsyncPipe, TranslatePipe, ApplyPipe, IncludesPipe, SortPipe, LocalizedConceptNamePipe, EntityPropertyNamePipe]
})
export class CodeSystemConceptsPropertyViewComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private codeSystemService = inject(CodeSystemLibService);
  protected translateService = inject(TranslateService);
  private http = inject(HttpClient);
  private auth = inject(AuthService);

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


  public constructor() {
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
    q.propertyValues =
      this.selectedPropertyValues?.filter(pv => pv.values?.length > 0).map(pv => pv.propertyName + '|' + pv.values.map(v => v.code).join(',')).join(';');
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
      const pv = this.selectedPropertyValues.find(p => p.propertyName === propertyName);
      pv.values = [...pv.values.filter(v => v.code !== p.code)];
      this.selectedPropertyValues = [...this.selectedPropertyValues.filter(p => p.propertyName !== pv.propertyName), pv];
    } else {
      const pv = this.selectedPropertyValues?.find(pv => pv.propertyName === propertyName);
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

  protected valueSelected = (code: string, selectedPropertyValues: {propertyName: string, values: {code: string, codeSystem: string}[]}[],
    propertyName?: string): boolean => {
    propertyName = propertyName || this.selectedProperty.propertyName;
    return !!selectedPropertyValues?.find(p => p.propertyName === propertyName && p.values.map(v => v.code).includes(code));
  };

  protected getConceptCnt = (code: string, conceptSummary: CodeSystemEntityPropertyConceptSummary): number => {
    return conceptSummary?.items?.find(i => i.propertyCode === code)?.conceptCnt || 0;
  };


  protected decorate = (items: CodeSystemEntityPropertySummaryItem[], properties: EntityProperty[]): CodeSystemEntityPropertySummaryItem[] => {
    items?.forEach(i => i['_property'] = this.getProperty(i.propertyId, properties));
    return items;
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
      (isDefined(version) ? `/versions/${version}` : '') + `/entity-property-concept-summary?entityPropertyId=${pId}` +
      (isDefined(epValues) ? `&entityPropertyValues=${epValues}` : '');
    this.loader.wrap('prop', this.http.get<CodeSystemEntityPropertyConceptSummary>(url)).subscribe(r => this.propertyConceptSummary = r);
  }
}
