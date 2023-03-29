import {Component, Input, OnInit} from '@angular/core';
import {CodeSystemConcept, CodeSystemEntityVersion, CodeSystemVersion, ConceptSearchParams, EntityProperty} from 'term-web/resources/_lib';
import {debounceTime, finalize, Observable, of, Subject, switchMap} from 'rxjs';
import {BooleanInput, compareValues, copyDeep, SearchResult} from '@kodality-web/core-util';
import {CodeSystemService} from '../../../services/code-system.service';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {MuiTreeNode, MuiTreeNodeOptions} from '@kodality-web/marina-ui';

@Component({
  selector: 'tw-code-system-concepts-list',
  templateUrl: './code-system-concepts-list.component.html',
  styles: [`
    ::ng-deep .concept-tree {
      .m-tree-node__option {
        width: 100%;
      }

      .m-tree-toggle {
        align-self: center;
      }
    }`]
})
export class CodeSystemConceptsListComponent implements OnInit {
  @Input() public dev: boolean = false;
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public codeSystemId?: string;
  @Input() public codeSystemVersions?: CodeSystemVersion[];
  @Input() public properties?: EntityProperty[];

  public query = new ConceptSearchParams();
  public filter: {open: boolean, languages?: string[], version?: CodeSystemVersion, propertyName?: string, propertyValue?: string} = {open: false};
  public group: {open: boolean, type?: string, association?: string, property?: string} = {open: false};
  public searchInput: string = "";
  public searchUpdate = new Subject<void>();
  public searchResult: SearchResult<CodeSystemConcept> = SearchResult.empty();
  public rootConcepts?: MuiTreeNodeOptions[];

  public loading = false;

  public constructor(
    private router: Router,
    private codeSystemService: CodeSystemService,
    private translateService: TranslateService
  ) {
    this.query.sort = 'code';
  }

  public ngOnInit(): void {
    this.loadData();
    this.expandTree();
    this.searchUpdate.pipe(
      debounceTime(250),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    if (!this.codeSystemId) {
      return of(this.searchResult);
    }
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    if (this.filter.propertyName && this.filter.propertyValue) {
      q.propertyValues = this.filter['propertyName'] + '|' + this.filter['propertyValue'];
    }
    this.loading = true;
    return this.codeSystemService.searchConcepts(this.codeSystemId, q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public initFilterLanguages(supportedLanguages: string[]): void {
    if (!supportedLanguages) {
      this.filter.languages = undefined;
      return;
    }
    this.filter.languages = supportedLanguages.includes('en') ? ['en'] : [supportedLanguages[0]];
    this.filter.languages = [...this.filter.languages];
  }

  public getConceptName(concept: CodeSystemConcept, language?: string): string | undefined {
    const findVersion = concept.versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
    const findDesignation = findVersion?.designations?.find(
      designation => ['draft', 'active'].includes(designation.status!) && (!language || designation.language === language));
    return findDesignation?.name;
  }

  public groupConcepts(groupParam: string): void {
    if (!this.codeSystemId) {
      return;
    }
    const params = new ConceptSearchParams();
    params.propertyRoot = this.group.type === 'property' && groupParam || undefined;
    params.associationRoot = this.group.type === 'association' && groupParam || undefined;
    params.sort = 'code';
    params.limit = 1000;
    this.loading = true;
    this.codeSystemService.searchConcepts(this.codeSystemId!, params).subscribe(concepts => {
      this.rootConcepts = concepts.data.map(c => this.mapToNode(c));
    }).add(() => this.loading = false);
  }

  public loadChildren(node: MuiTreeNode): void {
    if (node.loading) {
      const params = new ConceptSearchParams();
      params.propertySource = this.group.type === 'property' && this.group.property + '|' + node.key || undefined;
      params.associationSource = this.group.type === 'association' && this.group.association + '|' + node.key || undefined;
      params.sort = 'code';
      params.limit = 1000;
      this.codeSystemService.searchConcepts(this.codeSystemId!, params).subscribe(concepts => node.setChildren(concepts.data.map(c => this.mapToNode(c))));
    }
  }

  public mapToNode(c: CodeSystemConcept): MuiTreeNodeOptions {
    const name = this.getConceptName(c, this.translateService.currentLang);
    return {title: c.code + (name ? ' - ' + name : ''), key: c.code, expandable: !c.leaf};
  }

  public openConcept(code?: string, parentCode?: string): void {
    const lastVersionCode = this.dev && this.findLastVersionCode();
    if (!code) {
      const path = 'resources/code-systems/' + this.codeSystemId + (lastVersionCode ? ('/versions/' + lastVersionCode + '/concepts/add') : '/concepts/add');
      this.router.navigate([path], {queryParams: {parent: parentCode}});
      return;
    }
    const path = 'resources/code-systems/' + this.codeSystemId + (lastVersionCode ? ('/versions/' + lastVersionCode + '/concepts/') : '/concepts/') + code +
      (!this.viewMode ? '/edit' : '/view');
    this.router.navigate([path], {queryParams: {parent: parentCode}});
  }

  private expandTree(): void {
    if (!this.codeSystemId) {
      return;
    }
    const params = new ConceptSearchParams();
    params.associationType = 'is-a';
    params.limit = 1;
    this.codeSystemService.searchConcepts(this.codeSystemId!, params).subscribe(resp => {
      if (resp.data.length > 0) {
        this.group.open = true;
        this.group.type = 'association';
        this.group.association = 'is-a';
        this.groupConcepts(this.group.association);
      }
    });
  }

  private findLastVersionCode(): string | undefined {
    return this.codeSystemVersions?.filter(v => ['draft', 'active'].includes(v.status!))
      .sort((a, b) => compareValues(a.releaseDate, b.releaseDate))?.[0]?.version;
  }

  public findLastVersion(versions: CodeSystemEntityVersion[]): CodeSystemEntityVersion | undefined {
    return versions
      .filter(v => ['draft', 'active'].includes(v.status!))
      .sort((a, b) => new Date(a.created!) > new Date(b.created!) ? -1 : new Date(a.created!) > new Date(b.created!) ? 1 : 0)?.[0];
  }
}
