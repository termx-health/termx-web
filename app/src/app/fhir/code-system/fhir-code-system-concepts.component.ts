import {ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {MuiInputModule, MuiButtonModule, MuiIconModule} from '@termx-health/ui';
import {
  buildHierarchyForMode,
  codeSystemSupportsTreeView,
  getParentPropertyCodes,
  readParentKeys,
  resolveHierarchyModeWithConcepts,
} from 'term-web/fhir/code-system/code-system-hierarchy';

interface FlatNode {
  concept: any;
  level: number;
  expandable: boolean;
  expanded: boolean;
  /** Unique per placement — a multi-parent concept appears under each of its parents. */
  key: string;
  /** Parent codes shown as an attribute, so the list view is as informative as the tree. */
  parents: string[];
}

/**
 * CodeSystem "Content" viewer: hierarchical tree + flat list with search, over a CDK
 * virtual-scroll viewport so large code systems (e.g. rhk10, 37k concepts) stay responsive.
 *
 * The hierarchy resolution is the ported terminology-explorer solution
 * ({@link ./code-system-hierarchy}); only the rendering is reimplemented on marina UI.
 */
@Component({
  selector: 'tw-fhir-code-system-concepts',
  templateUrl: './fhir-code-system-concepts.component.html',
  imports: [FormsModule, ScrollingModule, RouterLink, MuiInputModule, MuiButtonModule, MuiIconModule],
})
export class FhirCodeSystemConceptsComponent implements OnChanges {
  private cdr = inject(ChangeDetectorRef);

  @Input() public codeSystem?: any;

  protected viewMode: 'tree' | 'list' = 'list';
  protected treeAvailable = false;
  protected filterContent = '';
  protected readonly itemSize = 40;

  protected flattenedNodes: FlatNode[] = [];

  private readonly recurseKey = 'concept';
  private treeConcepts: any[] = [];       // hierarchy-shaped concepts
  private flatConcepts: any[] = [];       // every concept, exactly once (list mode)
  private parentPropertyCodes: string[] = [];
  private filteredTree: any[] = [];       // tree after the active search filter
  private expandedKeys = new Set<string>();
  private search$ = new Subject<void>();

  constructor() {
    this.search$.pipe(debounceTime(300), takeUntilDestroyed()).subscribe(() => this.applyFilter());
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystem'] && this.codeSystem) {
      this.init();
    }
  }

  private init(): void {
    const raw: any[] = this.codeSystem.concept || [];
    const mode = resolveHierarchyModeWithConcepts(this.codeSystem, raw);
    this.parentPropertyCodes = mode ? [...new Set([...getParentPropertyCodes(mode), 'parent'])] : [];
    this.treeConcepts = mode && raw.length ? buildHierarchyForMode([...raw], mode, this.recurseKey) : raw;
    // List mode reads the SOURCE concepts, not the tree. The tree repeats a multi-parent concept
    // under each parent, so flattening it back would show the same code several times — the very
    // duplication the flat export exists to avoid.
    this.flatConcepts = this.dedupeByCode(this.flattenAll(raw));
    this.treeAvailable = codeSystemSupportsTreeView(this.codeSystem);
    // Default to tree only when the code system declares a hierarchy meaning; otherwise list.
    this.viewMode = this.treeAvailable && this.codeSystem.hierarchyMeaning ? 'tree' : 'list';
    this.filterContent = '';
    this.expandedKeys.clear();
    this.applyFilter();
  }

  /** Guards against a legacy nested export, where one code can appear under several parents. */
  private dedupeByCode(concepts: any[]): any[] {
    const byCode = new Map<string, any>();
    for (const c of concepts) {
      if (!byCode.has(String(c.code))) {
        byCode.set(String(c.code), c);
      }
    }
    return [...byCode.values()];
  }

  private flattenAll(concepts: any[]): any[] {
    const out: any[] = [];
    const walk = (list: any[]): void => {
      for (const c of list) {
        out.push(c);
        const kids = c[this.recurseKey];
        if (kids?.length) {
          walk(kids);
        }
      }
    };
    walk(concepts || []);
    return out;
  }

  protected setView(mode: 'tree' | 'list'): void {
    if (this.viewMode === mode) {
      return;
    }
    this.viewMode = mode;
    this.applyFilter();
  }

  protected onSearch(): void {
    this.search$.next();
  }

  private applyFilter(): void {
    const term = this.filterContent.trim().toLowerCase();
    if (this.viewMode === 'list') {
      const list = term ? this.flatConcepts.filter(c => this.matches(c, term)) : this.flatConcepts;
      this.flattenedNodes = list.map(c => ({
        concept: c,
        level: 0,
        expandable: false,
        expanded: false,
        key: String(c.code),
        parents: this.parentsOf(c),
      }));
    } else {
      this.filteredTree = term ? this.filterTree(this.treeConcepts, term) : this.treeConcepts;
      // Auto-expand matches while searching; restore manual state when the box is cleared.
      this.expandedKeys = term ? new Set(this.allParentKeys(this.filteredTree)) : this.expandedKeys;
      this.flattenedNodes = this.flattenVisible(this.filteredTree, 0);
    }
    this.cdr.markForCheck();
  }

  private matches(c: any, term: string): boolean {
    return !!(
      c.code?.toString().toLowerCase().includes(term) ||
      c.display?.toString().toLowerCase().includes(term) ||
      c.definition?.toString().toLowerCase().includes(term)
    );
  }

  private filterTree(concepts: any[], term: string): any[] {
    return concepts.reduce((acc: any[], c: any) => {
      const kids = c[this.recurseKey] ? this.filterTree(c[this.recurseKey], term) : [];
      if (this.matches(c, term) || kids.length) {
        acc.push({...c, [this.recurseKey]: kids});
      }
      return acc;
    }, []);
  }

  private parentsOf(concept: any): string[] {
    return this.parentPropertyCodes.length ? readParentKeys(concept, this.parentPropertyCodes) : [];
  }

  private flattenVisible(concepts: any[], level: number, parentKey = ''): FlatNode[] {
    const nodes: FlatNode[] = [];
    for (const c of concepts) {
      const kids = c[this.recurseKey];
      const expandable = kids?.length > 0;
      const expanded = this.expandedKeys.has(c.code);
      // Keyed by path, not by code: the same concept can be rendered under several parents, and a
      // code-only trackBy would collide across those placements.
      const key = `${parentKey}/${c.code}`;
      nodes.push({concept: c, level, expandable, expanded, key, parents: this.parentsOf(c)});
      if (expandable && expanded) {
        nodes.push(...this.flattenVisible(kids, level + 1, key));
      }
    }
    return nodes;
  }

  private allParentKeys(concepts: any[]): string[] {
    const keys: string[] = [];
    const walk = (list: any[]): void => {
      for (const c of list) {
        const kids = c[this.recurseKey];
        if (kids?.length) {
          keys.push(c.code);
          walk(kids);
        }
      }
    };
    walk(concepts);
    return keys;
  }

  protected toggle(code: string): void {
    if (this.expandedKeys.has(code)) {
      this.expandedKeys.delete(code);
    } else {
      this.expandedKeys.add(code);
    }
    this.flattenedNodes = this.flattenVisible(this.filteredTree, 0);
  }

  protected expandAll(): void {
    this.expandedKeys = new Set(this.allParentKeys(this.filteredTree));
    this.flattenedNodes = this.flattenVisible(this.filteredTree, 0);
  }

  protected collapseAll(): void {
    this.expandedKeys = new Set<string>();
    this.flattenedNodes = this.flattenVisible(this.filteredTree, 0);
  }

  protected trackByCode = (_index: number, node: FlatNode): string => node.key;
}
