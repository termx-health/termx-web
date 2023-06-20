import {Component, Input, OnInit} from '@angular/core';
import {CodeSystemConcept, CodeSystemEntityVersion, CodeSystemVersion, ConceptSearchParams, EntityProperty} from 'term-web/resources/_lib';
import {debounceTime, Observable, of, startWith, Subject, switchMap} from 'rxjs';
import {BooleanInput, compareValues, copyDeep, LoadingManager, SearchResult} from '@kodality-web/core-util';
import {CodeSystemService} from '../../../services/code-system.service';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

interface ConceptNode {
  code: string;
  children?: ConceptNode[];

  expandable?: boolean;
  expanded?: boolean;
  loading?: boolean;

  concept: CodeSystemConcept
}

@Component({
  selector: 'tw-code-system-concepts-list',
  templateUrl: './code-system-concepts-list.component.html',
  styles: [`
    @import "../../../../../../../../node_modules/@kodality-web/marina-ui/src/components/card/style";

    ::ng-deep .recursive-card-inside-flatten .m-card {
      .m-card-inside;
    }

    ::ng-deep .concept-tree {
      .m-tree-node__option {
        width: 100%;
      }

      .m-tree-toggle {
        align-self: center;
      }
    }

    .nowrap {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

  `]
})
export class CodeSystemConceptsListComponent implements OnInit {
  @Input() @BooleanInput() public dev?: boolean | string;
  @Input() @BooleanInput() public viewMode: boolean | string;
  @Input() public codeSystemId?: string;
  @Input() public codeSystemVersions?: CodeSystemVersion[];
  @Input() public properties?: EntityProperty[];

  protected search$ = new Subject<void>();
  protected searchInput: {input?: string, type: 'eq' | 'contains'} = {type: 'contains'};

  protected filter: {
    open: boolean, languages?: string[],
    version?: CodeSystemVersion,
    propertyName?: string,
    propertyValue?: string
  } = {open: false};

  protected group: {
    open: boolean,
    type?: string,
    association?: string,
    property?: string
  } = {open: false};

  protected query = new ConceptSearchParams();
  protected searchResult: SearchResult<CodeSystemConcept> = SearchResult.empty();
  protected rootConcepts?: ConceptNode[];

  protected selectedConcept: {code: string, version: CodeSystemEntityVersion};
  protected loader = new LoadingManager();


  public constructor(
    private router: Router,
    private codeSystemService: CodeSystemService,
    protected translateService: TranslateService
  ) {
    this.query.sort = 'code';
  }

  public ngOnInit(): void {
    this.search$.pipe(
      startWith(null),
      debounceTime(250),
      switchMap(() => this.search()),
    ).subscribe(data => {
      this.searchResult = data;
    });

    this.expandTree();
  }

  private expandTree(): void {
    if (!this.codeSystemId) {
      return;
    }
    this.codeSystemService.searchConcepts(this.codeSystemId, {associationType: 'is-a', limit: 0}).subscribe(resp => {
      if (resp.meta.total > 0) {
        this.group.open = true;
        this.group.type = 'association';
        this.group.association = 'is-a';
        this.groupConcepts(this.group.association);
      }
    });
  }


  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    if (!this.codeSystemId) {
      return of(this.searchResult);
    }

    const {type, input} = this.searchInput;

    const q = copyDeep(this.query);
    q.textContains = type === 'contains' ? input : undefined;
    q.textEq = type === 'eq' ? input : undefined;
    if (this.filter.propertyName && this.filter.propertyValue) {
      q.propertyValues = `${this.filter.propertyName}|${this.filter.propertyValue}`;
    }

    return this.loader.wrap('search', this.codeSystemService.searchConcepts(this.codeSystemId, q));
  }


  protected initFilterLanguages(supportedLanguages: string[]): void {
    if (!supportedLanguages) {
      this.filter.languages = undefined;
      return;
    }
    this.filter.languages = supportedLanguages.includes('en') ? ['en'] : [supportedLanguages[0]];
    this.filter.languages = [...this.filter.languages];
  }


  protected groupConcepts(groupParam: string): void {
    if (!this.codeSystemId) {
      return;
    }

    const params = new ConceptSearchParams();
    params.propertyRoot = this.group.type === 'property' ? groupParam : undefined;
    params.associationRoot = this.group.type === 'association' ? groupParam : undefined;
    params.sort = 'code';
    params.limit = 1000;

    this.loader.wrap('group', this.codeSystemService.searchConcepts(this.codeSystemId, params)).subscribe(concepts => {
      this.rootConcepts = concepts.data.map(c => this.mapToNode(c));
    });
  }


  protected selectConcept(concept: CodeSystemConcept): void {
    if (concept?.code === this.selectedConcept?.code) {
      this.selectedConcept = undefined;
    } else {
      this.selectedConcept = {code: concept.code, version: concept.versions[concept.versions.length - 1]};
    }
  }


  public loadChildConcepts(node: ConceptNode): void {
    if (node.expanded) {
      node.expanded = false;
      node.children = [];
      return;
    }

    if (!node.loading) {
      node.loading = true;

      const params = new ConceptSearchParams();
      params.propertySource = this.group.type === 'property' ? `${this.group.property}|${node.code}` : undefined;
      params.associationSource = this.group.type === 'association' ? `${this.group.association}|${node.code}` : undefined;
      params.sort = 'code';
      params.limit = 1000;

      this.codeSystemService.searchConcepts(this.codeSystemId!, params).subscribe(concepts => {
        node.children = concepts.data.map(c => this.mapToNode(c));
        node.expanded = true;
      }).add(() => node.loading = false);
    }
  }

  private mapToNode(c: CodeSystemConcept): ConceptNode {
    return {
      code: c.code,
      expandable: !c.leaf,
      concept: c
    };
  }


  protected openConcept(code?: string, parentCode?: string): void {
    const lastVersionCode = this.dev && this.findLastCodeSystemVersion();
    if (!code) {
      const path = '/resources/code-systems/' + this.codeSystemId + (lastVersionCode ? ('/versions/' + lastVersionCode + '/concepts/add') : '/concepts/add');
      this.router.navigate([path], {queryParams: {parent: parentCode}});
      return;
    }
    const path = '/resources/code-systems/' + this.codeSystemId + (lastVersionCode ? ('/versions/' + lastVersionCode + '/concepts/') : '/concepts/') + code +
      (!this.viewMode ? '/edit' : '/view');
    this.router.navigate([path], {queryParams: {parent: parentCode}});
  }


  protected findLastEntityVersion = (versions: CodeSystemEntityVersion[]): CodeSystemEntityVersion => {
    return versions
      .filter(v => ['draft', 'active'].includes(v.status))
      .sort((a, b) => compareValues(a.created, b.created))?.[0];
  };

  private findLastCodeSystemVersion = (): string => {
    return this.codeSystemVersions
      ?.filter(v => ['draft', 'active'].includes(v.status))
      ?.sort((a, b) => compareValues(a.releaseDate, b.releaseDate))?.[0]?.version;
  };
}
