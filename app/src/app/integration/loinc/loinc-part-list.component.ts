import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {compareStrings, compareValues, isDefined, LoadingManager, SearchResult} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {Observable, tap} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import {CodeSystemConcept, CodeSystemEntityVersion, CodeSystemLibService, ConceptSearchParams, EntityProperty} from 'term-web/resources/_lib';

@Component({
  selector: 'tw-loinc-part-list',
  templateUrl: './loinc-part-list.component.html',
})
export class LoincPartListComponent implements OnInit {
  protected breadcrumb: string[];

  protected properties: EntityProperty[];
  protected radProperties: EntityProperty[];
  protected docProperties: EntityProperty[];

  protected partsQuery = new ConceptSearchParams();
  protected partsSearchInput: string;
  protected parts: SearchResult<CodeSystemConcept> = SearchResult.empty();

  protected loincConcepts: CodeSystemConcept[];

  protected loader = new LoadingManager();

  public constructor(
    private codeSystemService: CodeSystemLibService,
    private translateService: TranslateService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.codeSystemService.load('loinc', true).subscribe(cs => {
      const prop = cs.properties
        .filter(p => !['answer-list', 'answer-list-binding', 'display', 'key-words'].includes(p.name))
        .sort((p1, p2) => compareStrings(p1.name, p2.name));
      this.properties = prop.filter(p => !p.name.startsWith('Rad') && !p.name.startsWith('Document'));
      this.radProperties = prop.filter(p => p.name.startsWith('Rad'));
      this.docProperties = prop.filter(p => p.name.startsWith('Document'));
    });

    this.route.queryParams.subscribe(p => {
      if (p['tab'] === 'parts') {
        this.handlePath(p['path']);
      }
    });
  }

  public loadParts(type?: string): void {
    if (type) {
      this.breadcrumb = ['...', type];
      this.partsQuery.propertyValues = type ? 'type|' + type : this.partsQuery.propertyValues;
      this.router.navigate(['/integration/loinc'], {queryParams: {tab: 'parts', path: this.breadcrumb.join(",")}});
    }
    this.searchParts().subscribe(r => this.parts = r);
  }

  public searchParts(): Observable<SearchResult<CodeSystemConcept>> {
    this.partsQuery.textContains = this.partsSearchInput;
    return this.loader.wrap('parts', this.codeSystemService.searchConcepts('loinc-part', this.partsQuery));
  }

  protected onSearchParts = (): Observable<SearchResult<CodeSystemConcept>> => {
    this.partsQuery.offset = 0;
    return this.searchParts().pipe(tap(resp => this.parts = resp));
  };

  public openProperties(crumb: string): void {
    if (crumb === '...') {
      this.breadcrumb = [];
    }
  }

  protected getName = (c: CodeSystemConcept, type = 'display'): string => {
    const lang = this.translateService.currentLang;
    const version = this.getLastVersion(c?.versions);
    const displays = version?.designations?.filter(d => d.designationType === type).sort((d1, d2) => d1.language === lang ? 0 : 1);
    return displays?.length > 0 ? displays[0]?.name : '';
  };

  private getLastVersion(versions: CodeSystemEntityVersion[]): CodeSystemEntityVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  }

  public loadLoinc(partCode): void {
    this.breadcrumb = [...this.breadcrumb, partCode];
    const type = this.breadcrumb[this.breadcrumb.length - 2];
    const q = new ConceptSearchParams();
    q.propertyValues = type + '|' + partCode;
    q.limit = 100;
    this.loader.wrap('loinc', this.codeSystemService.searchConcepts('loinc', q)).subscribe(r => this.loincConcepts = r.data);
    this.router.navigate(['/integration/loinc'], {queryParams: {tab: 'parts', path: this.breadcrumb.join(",")}});
  }

  protected openConcept(code: string, cs: string): void {
    const canEdit = this.authService.hasPrivilege(`${cs}.CodeSystem.edit`);
    const path = '/resources/code-systems/' + cs + '/concepts/' + code + (canEdit ? '/edit' : '/view');
    this.router.navigate([path]);
  }

  private handlePath(path: string): void {
    if (!isDefined(path)) {
      this.openProperties('...');
      return;
    }
    const components = path.split(',');
    if (components.length === 2) {
      this.loadParts(components[1]);
    } else if (components.length === 3) {
      this.breadcrumb = [components[0], components[1]];
      this.loadLoinc(components[2]);
    } else {
      this.openProperties('...');
    }
  }
}
