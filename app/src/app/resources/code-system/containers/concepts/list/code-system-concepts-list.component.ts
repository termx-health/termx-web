import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {
  CodeSystem,
  CodeSystemConcept,
  CodeSystemEntityVersion,
  CodeSystemVersion,
  ConceptSearchParams,
  Designation,
  EntityProperty,
  EntityPropertyValue
} from 'app/src/app/resources/_lib';
import {forkJoin, map, mergeMap, Observable, of, tap} from 'rxjs';
import {BooleanInput, ComponentStateStore, copyDeep, group, isDefined, LoadingManager, SearchResult} from '@kodality-web/core-util';
import {CodeSystemService} from '../../../services/code-system.service';
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
    @import "../../../../../../../../node_modules/@kodality-web/marina-ui/src/components/card/style/card.style.less";

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

    tw-code-system-concepts-list-concept-preview {
      position: sticky;
      top: calc(var(--page-header-height) + var(--gap-default) + 6rem); // fixme: magic number 6rem, approximate height of context header (OP-5276)
    }
  `]
})
export class CodeSystemConceptsListComponent implements OnInit, OnDestroy {
  protected readonly STORE_KEY = 'code-system-concept-list';

  @Input() public codeSystem?: CodeSystem;
  @Input() public version?: CodeSystemVersion;
  @Input() public versions?: CodeSystemVersion[];
  @Input() @BooleanInput() public viewMode: boolean | string;

  protected groupOpened: boolean = false;
  protected tableView: {langs?: string[], properties?: string[]} = {};
  protected filter: {
    open: boolean, languages?: string[],
    version?: CodeSystemVersion,
    propertyName?: string,
    propertyValue?: string,
    searchInput?: string,
    inputType: 'eq' | 'contains'
  } = {open: false, inputType: 'contains'};

  protected query = new ConceptSearchParams();
  protected searchResult = SearchResult.empty<CodeSystemConcept>();
  protected rootConcepts?: ConceptNode[] = [];

  protected selectedConcept: {code: string, version: CodeSystemEntityVersion};
  protected loader = new LoadingManager();


  public constructor(
    private codeSystemService: CodeSystemService,
    protected translateService: TranslateService,
    private stateStore: ComponentStateStore,
  ) {
    this.query.sort = 'code';
  }

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state && state.codeSystemId === this.codeSystem?.id) {
      this.restoreState(state);
      return;
    }

    if (this.codeSystem.hierarchyMeaning) {
      this.groupOpened = true;
      this.expandTree();
    }

    this.loadData();
  }

  public ngOnDestroy(): void {
    this.saveState();
  }

  protected toggleView(): void {
    this.groupOpened = !this.groupOpened;
    this.filter.open = false;
    this.selectedConcept = undefined;
  }

  private expandTree(): void {
    this.groupConcepts(this.codeSystem.hierarchyMeaning);
  }

  protected groupConcepts(groupParam: string): void {
    this.loadRootConcepts(groupParam).subscribe(resp => {
      this.rootConcepts = resp.map(c => this.mapToNode(c));
    });
  }

  private loadRootConcepts(groupParam: string): Observable<CodeSystemConcept[]> {
    const params = new ConceptSearchParams();
    params.associationRoot = groupParam;
    params.codeSystemVersion = this.version?.version;
    params.sort = 'code';
    params.limit = 1000;

    return this.loader.wrap('group', this.codeSystemService.searchConcepts(this.codeSystem.id, params)).pipe(map(resp => resp.data));
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  protected onFilterSearch(): void {
    this.query.offset = 0;
    this.loadData();
  }

  private search(): Observable<SearchResult<CodeSystemConcept>> {
    const q = copyDeep(this.query);
    q.textContains = this.filter.inputType === 'contains' ? this.filter.searchInput : undefined;
    q.textEq = this.filter.inputType === 'eq' ? this.filter.searchInput : undefined;
    q.codeSystemVersion = this.version?.version;
    q.propertyValues = this.filter.propertyName && this.filter.propertyValue ? `${this.filter.propertyName}|${this.filter.propertyValue}` : undefined;
    return this.loader.wrap('search', this.codeSystemService.searchConcepts(this.codeSystem.id, q));
  }

  protected reset(): void {
    this.filter = {open: false, inputType: 'contains'};
  }

  protected selectConcept(concept: CodeSystemConcept): void {
    if (concept?.code === this.selectedConcept?.code) {
      this.selectedConcept = undefined;
    } else {
      this.selectedConcept = {code: concept.code, version: concept.versions[concept.versions.length - 1]};
    }
  }

  protected expandNode(node: ConceptNode): void {
    if (node.expanded) {
      node.expanded = false;
      node.children = [];
      return;
    }

    if (!node.loading) {
      node.loading = true;

      this.loadChildren(node.code).subscribe(concepts => {
        node.children = concepts.data.map(c => this.mapToNode(c));
        node.expanded = true;
      }).add(() => node.loading = false);
    }
  }

  private loadChildren(code: string): Observable<SearchResult<CodeSystemConcept>> {
    const params = new ConceptSearchParams();
    params.associationSource = `${this.codeSystem.hierarchyMeaning}|${code}`;
    params.codeSystemVersion = this.version?.version;
    params.sort = 'code';
    params.limit = 1000;
    return this.codeSystemService.searchConcepts(this.codeSystem.id, params);
  }

  private mapToNode(c: CodeSystemConcept): ConceptNode {
    return {
      code: c.code,
      expandable: !c.leaf,
      concept: c
    };
  }

  protected getConceptEditRoute = (code?: string, parentCode?: string): {path: any[], query: any} => {
    if (!code) {
      const path = `/resources/code-systems/${this.codeSystem.id}${this.version?.version ? `/versions/${this.version?.version}/concepts/add` : '/concepts/add'}`;
      return {path: [path], query: {parent: parentCode}};
    }

    const mode = this.viewMode ? '/view' : '/edit';
    const path = `/resources/code-systems/${this.codeSystem.id}${this.version?.version ? `/versions/${this.version?.version}/concepts/` : '/concepts/'}${encodeURIComponent(code)}${mode}`;
    return {path: [path], query: {parent: parentCode}};
  };

  protected getDesignations = (concept: CodeSystemConcept): Designation[] => {
    return concept.versions.flatMap(v => v.designations).filter(d => isDefined(d));
  };

  protected getPropertyValues = (concept: CodeSystemConcept): EntityPropertyValue[] => {
    return concept.versions.flatMap(v => v.propertyValues).filter(pv => isDefined(pv));
  };
  protected filterPropertyValues = (pv: EntityPropertyValue, selectedProperties: string[], csProperties: EntityProperty[]): boolean => {
    if (selectedProperties?.length > 0) {
      return selectedProperties.includes(pv.entityProperty);
    }
    return !!csProperties?.find(p => p.id === pv.entityPropertyId && p.showInList);
  };

  protected getSupportedLangs = (version: CodeSystemVersion, versions: CodeSystemVersion[]) => {
    if (version) {
      return version.supportedLanguages;
    }
    if (versions) {
      return [...new Set(versions.flatMap(v => v.supportedLanguages))];
    }
    return [];
  };

  protected getProperty = (id: number, properties: EntityProperty[]): EntityProperty => {
    return properties?.find(p => p.id === id);
  };

  protected unlink(concept: CodeSystemConcept): void {
    const entityVersionIds = concept.versions.map(v => v.id);
    this.codeSystemService.unlinkEntityVersions(this.codeSystem.id, this.version.version, entityVersionIds).subscribe(() => {
      if (this.codeSystem.hierarchyMeaning) {
        this.expandTree();
      }
      this.loadData();
    });
  }

  protected propagateProperties(concept: CodeSystemConcept): void {
    this.loadChildren(concept.code).subscribe(children => {
      this.codeSystemService.propagateProperties(this.codeSystem.id, concept.code, children.data.map(c => c.id)).subscribe(() => {
        this.expandTree();
      });
    });
  }

  private saveState(): void {
    const collectExpandedCodes = (nodes: ConceptNode[], res: string[]) => {
      nodes?.filter(n => n.expanded).forEach(n => {
        res.push(n.code);
        collectExpandedCodes(n.children, res);
      });
    };

    const expanded = [];
    collectExpandedCodes(this.rootConcepts, expanded);

    this.stateStore.put(this.STORE_KEY, {
      codeSystemId: this.codeSystem.id,

      groupOpened: this.groupOpened,
      tableView: this.tableView,
      filter: this.filter,

      query: this.query,
      expandedNodes: expanded,

      scrollY: window.scrollY
    });
  }

  private restoreState(state): void {
    this.groupOpened = state.groupOpened;

    this.tableView = state.tableView;
    this.filter = state.filter;
    this.query = state.query;

    const searchResult$ = this.search().pipe(
      tap(resp => this.searchResult = resp)
    );

    const rootConcepts$ = (this.codeSystem?.hierarchyMeaning ? this.loadRootConcepts(this.codeSystem.hierarchyMeaning) : of([])).pipe(
      mergeMap(concepts => {
        const roots = concepts.map(c => this.mapToNode(c));
        const children: Observable<{code: string, data: CodeSystemConcept[]}>[] = state.expandedNodes.map(code => {
          return this.loadChildren(code).pipe(map(r => ({code, data: r.data})));
        });
        return forkJoin([of(roots), ...children]);
      }),
      tap(([rootConcepts, ...resp]) => {
        this.rootConcepts = rootConcepts;

        const childMap = group(resp, v => v.code, v => v.data);
        const expand = (child: ConceptNode): void => {
          if (childMap[child.code]) {
            child.expanded = true;
            child.children = childMap[child.code].map(n => this.mapToNode(n));
            child.children.forEach(c => expand(c));
          }
        };
        this.rootConcepts.forEach(c => expand(c));
      })
    );

    this.loader.wrap('group', forkJoin([searchResult$, rootConcepts$])).subscribe(() => {
      setTimeout(() => {
        window.scrollTo({
          top: state.scrollY,
          left: 0,
          behavior: 'smooth',
        });
      });
    });
  }

  protected openFhir(code: string): void {
    window.open(window.location.origin + '/fhir/CodeSystem/' + this.codeSystem.id + '/lookup' + '?_code=' + code, '_blank');
  }
}
