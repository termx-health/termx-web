import {Component, Input, OnInit} from '@angular/core';
import {
  CodeSystem,
  CodeSystemConcept, CodeSystemLibService,
  CodeSystemVersion,
  ConceptSearchParams, ConceptUtil,
  Designation,
  EntityProperty,
  EntityPropertyValue, ValueSetLibService, ValueSetVersionConcept, VsConceptUtil
} from 'app/src/app/resources/_lib';
import {forkJoin, map, Observable, of} from 'rxjs';
import {BooleanInput, copyDeep, isDefined, LoadingManager, SearchResult} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  templateUrl: './code-system-concepts-property-view.component.html'
})
export class CodeSystemConceptsPropertyViewComponent implements OnInit {
  protected codeSystem?: CodeSystem;
  protected versions?: CodeSystemVersion[];
  protected version?: CodeSystemVersion;

  @Input() @BooleanInput() public viewMode: boolean | string;


  protected tableView: {langs?: string[], properties?: string[]} = {};

  protected query = new ConceptSearchParams();
  protected searchResult = SearchResult.empty<CodeSystemConcept>();
  protected selectedProperty: EntityProperty;
  protected selectedPropertyValues: {propertyName: string, values: string[]}[];
  protected vsConcepts: ValueSetVersionConcept[];
  protected csConcepts: CodeSystemConcept[];

  protected loader = new LoadingManager();


  public constructor(
    private router: Router,
    private route: ActivatedRoute,
    private codeSystemService: CodeSystemLibService,
    private valueSetService: ValueSetLibService,
    protected translateService: TranslateService
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
    });
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    const q = copyDeep(this.query);
    q.codeSystemVersion = this.version?.version;
    q.propertyValues = this.selectedPropertyValues?.filter(pv => pv.values?.length > 0).map(pv => pv.propertyName + '|' + pv.values.join(',')).join(';');
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

  protected getCsDisplay = (concept: CodeSystemConcept): string => {
    return ConceptUtil.getDisplay(concept, this.translateService.currentLang);
  };

  protected getVsDisplay = (concept: ValueSetVersionConcept): string => {
    return VsConceptUtil.getDisplay(concept, this.translateService.currentLang);
  };

  protected filterExternalProperties = (p: EntityProperty): boolean => {
    return p?.type === 'Coding';
  };

  protected getConceptCount = (property: EntityProperty, value: string): Observable<number> => {
    if (!this.codeSystem?.id) {
      return of(0);
    }
    const p: ConceptSearchParams = {limit: 0};
    p.propertyValues = isDefined(property) && isDefined(value) ? property.name + '|' + value : undefined;
    p.properties = isDefined(property) && !isDefined(value) ? String(property.id) : undefined;
    return this.loader.wrap(isDefined(value) ? 'pv' : 'prop', this.codeSystemService.searchConcepts(this.codeSystem.id, p).pipe(map(r => r.meta.total)));
  };

  protected selectProperty(p: EntityProperty): void {
    this.selectedProperty = p;
    this.vsConcepts = [];
    this.csConcepts = [];
    if (p.rule?.valueSet) {
      this.loader.wrap('pv', this.valueSetService.expand({valueSet: p.rule.valueSet})).subscribe(concepts => this.vsConcepts = concepts);
    }
    if (p.rule?.codeSystems) {
      p.rule.codeSystems.forEach(cs => {
        this.loader.wrap('pv', this.codeSystemService.searchConcepts(cs, {limit: 1000})).subscribe(concepts => this.csConcepts = [...this.csConcepts, ...concepts.data]);
      });
    }
  }

  protected selectPropertyValue(code: string, propertyName?: string): void {
    propertyName = propertyName || this.selectedProperty.name;
    if (this.valueSelected(code, this.selectedPropertyValues, propertyName)) {
      let pv = this.selectedPropertyValues.find(p => p.propertyName === propertyName);
      pv.values = [...pv.values.filter(v => v !== code)];
      this.selectedPropertyValues = [...this.selectedPropertyValues.filter(p => p.propertyName !== pv.propertyName), pv];
    } else {
      let pv = this.selectedPropertyValues?.find(pv => pv.propertyName === propertyName);
      if (pv) {
        pv.values = [...pv.values, code];
        this.selectedPropertyValues = [...this.selectedPropertyValues.filter(p => p.propertyName !== pv.propertyName), pv];
      } else {
        this.selectedPropertyValues = [...(this.selectedPropertyValues || []), {propertyName: propertyName, values: [code]}];
      }
    }
    this.loadData();
  }

  protected valueSelected = (code: string, selectedPropertyValues: {propertyName: string, values: string[]}[], propertyName?: string): boolean => {
    propertyName = propertyName || this.selectedProperty.name;
    return !!selectedPropertyValues?.find(p => p.propertyName === propertyName && p.values.includes(code));
  };
}
