import {Component, EventEmitter, Injectable, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {PageService} from '../services/page.service';
import {EMPTY, forkJoin, map, mergeMap, Observable, of, tap} from 'rxjs';
import {Router} from '@angular/router';
import {compareValues, copyDeep, isNil, LoadingManager, remove, SearchResult, unique} from '@kodality-web/core-util';
import {Page, PageContent, PageLink} from 'term-web/wiki/_lib';
import {DropListMoveEvent, DropListNode} from 'term-web/core/ui/components/drop-list/drop-list.component';
import {PageLinkService} from '../services/page-link.service';
import {WikiPageModalComponent} from './wiki-page-modal.component';
import {SpaceService} from 'term-web/space/services/space.service';
import {Space} from 'term-web/space/_lib';

function findInTree<Node, Key>(nodesToSearch: Node[], key: Key, getKey: (n: Node) => Key, getChildren: (n: Node) => Node[]): Node {
  for (let node of nodesToSearch) {
    if (getKey(node) == key) {
      return node;
    }
    const ret = findInTree(getChildren(node) ?? [], key, getKey, getChildren);
    if (ret) {
      return ret;
    }
  }
}

function findNode(listNodes: DropListNode[], key: string): DropListNode {
  return findInTree(listNodes, key, n => n.key, n => n.children);
}

function findDragNode(nodes: DragNode[], linkId: number): DragNode {
  return findInTree(nodes, linkId, n => n.link.id, n => n.children);
}


interface DragNode {
  link: PageLink,
  page: Page,
  expanded?: boolean
  leaf?: boolean
  children: DragNode[],
}

@Injectable()
class WikiSidebarService {
  public readonly DEFAULT_CONCEPT_LIMIT = 100;

  public compareOrder = (a, b): number => compareValues(Number(a.link.orderNumber), Number(b.link.orderNumber));

  protected toDragNode = (link: PageLink, page: Page): DragNode => ({
    link: link,
    page: page,
    leaf: page.leaf,
    children: []
  });

  public constructor(
    private pageService: PageService,
    private pageLinkService: PageLinkService,
  ) { }

  public search(spaceId: number, text: string): Observable<DragNode[]> {
    if (isNil(spaceId)) {
      return EMPTY;
    }

    return this.pageService.searchPages({
      spaceIds: spaceId,
      textContains: text,
      limit: this.DEFAULT_CONCEPT_LIMIT
    }).pipe(
      mergeMap(resp => {
        // pages get decorated with links
        const ids = resp.data.map(p => p.id);
        return forkJoin([this.pageLinkService.search({targetIds: ids.join(','), limit: ids.length}), of(resp)]);
      }),
      map(([links, pages]): DragNode[] => {
        return links.data.map(l => this.toDragNode(l, pages.data.find(p => p.id === l.targetId))).sort(this.compareOrder);
      }));
  };

  public loadRoots(spaceId: number): Observable<DragNode[]> {
    if (isNil(spaceId)) {
      return EMPTY;
    }

    return this.pageLinkService.search({
      spaceIds: spaceId,
      root: true,
      limit: this.DEFAULT_CONCEPT_LIMIT
    }).pipe(
      mergeMap(links => {
        // links get decorated with pages
        return this.decorateWithPages(links);
      }),
      map(([links, pages]): DragNode[] => {
        return links.data.map(l => this.toDragNode(l, pages.data.find(p => p.id === l.targetId))).sort(this.compareOrder);
      }));
  };

  public findChildren(spaceId: number, sourceId: number): Observable<DragNode[]> {
    if (isNil(spaceId)) {
      return EMPTY;
    }

    return this.pageLinkService
      .search({
        spaceIds: spaceId as any,
        sourceIds: String(sourceId),
        root: false,
        limit: this.DEFAULT_CONCEPT_LIMIT
      })
      .pipe(
        mergeMap(links => this.decorateWithPages(links)),
        map(([links, pages]) => links.data.map(l => this.toDragNode(l, pages.data.find(p => p.id === l.targetId)))),
        map(nodes => nodes.sort(this.compareOrder))
      );
  }


  private decorateWithPages(resp: SearchResult<PageLink>): Observable<[SearchResult<PageLink>, SearchResult<Page>]> {
    const ids = resp.data.map(l => l.targetId).filter(unique);
    return forkJoin([of(resp), this.pageService.searchPages({ids: ids.join(","), limit: ids.length})]);
  }
}

const NODE_OBJECT_KEY = 'obj';

@Component({
  selector: 'tw-wiki-sidebar',
  templateUrl: 'wiki-sidebar.component.html',
  styles: [`
    @import "../../../../styles/variables";

    .space-item {
      position: relative;
      padding: 0 0.5rem 0 1rem;
      border-radius: 2px;
      height: 2.4rem;
      cursor: pointer;
    }

    .space-item--selected {
      background: @mui-border-color-light;
      color: @mui-primary-color-6;
    }
  `],
  providers: [WikiSidebarService]
})
export class WikiSidebarComponent implements OnChanges {
  @Input() public path?: number[];
  @Input() public space?: Space;

  @Output() public viewRoot = new EventEmitter();
  @Output() public viewPage = new EventEmitter<string>();

  protected data: DragNode[] = [];
  protected searchText: string;

  protected selectedKey: string;
  protected nodes: DropListNode[] = [];

  protected loader = new LoadingManager();

  public constructor(
    private router: Router,
    private translateService: TranslateService,
    private pageLinkService: PageLinkService,
    private sidebarService: WikiSidebarService,
    private spaceService: SpaceService,
  ) { }


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['path']) {
      this.selectedKey = this.path?.length ? String(this.path[this.path.length - 1]) : this.selectedKey;
      if (this.data.every(obj => !obj['_expanded'])) {
        // fixme: when route is changed, the tree does not expand correctly
        this.expandPath(copyDeep(this.path), this.data);
      }
    }

    if (changes['space']) {
      this.loader.wrap('roots', this.loadRoots()).subscribe(() => {
        if (this.path) {
          this.expandPath(copyDeep(this.path), this.data);
          this.selectedKey = this.path?.length ? String(this.path[this.path.length - 1]) : this.selectedKey;
        }
      });
    }
  }


  /* Drop list API */

  protected onExpand(node: DropListNode): void {
    const obj: DragNode = node[NODE_OBJECT_KEY];
    obj.expanded = node.expanded;
    this.expandBranch(obj);
  }

  protected onSelect(node: DropListNode): void {
    const obj: DragNode = node[NODE_OBJECT_KEY];
    this.openPage(obj.page);

    if (!obj.leaf && !obj.expanded) {
      this.expandBranch(obj);
    }
  }

  protected onMove(event: DropListMoveEvent): void {
    const syncWithPages = (obj: DragNode, sourceContainerId: string, targetContainerId: string, idx: number): void => {
      if (sourceContainerId) {
        const source = findDragNode(this.data, Number(sourceContainerId));
        source.children ??= [];
        source.children = source.children.filter(lp => lp.link.id !== obj.link.id);

        if (!source.leaf) {
          // page was expanded, it is safe to assume all pages were loaded already
          // if no linked pages exists, we could assume that page is the leaf node
          source.leaf = source.children.length === 0;
          source.expanded = !source.leaf;
        }
      } else {
        this.data = this.data.filter(lp => lp.link.id !== obj.link.id);
      }

      if (targetContainerId) {
        const target = findDragNode(this.data, Number(targetContainerId));
        target.children ??= [];
        target.children.splice(idx, 0, obj);

        if (target.leaf) {
          // if page was not yet expanded, we can precalculate its leaf status
          // when user will expand the page, the actual result will be loaded
          target.leaf = target.children.length === 0;
        }

        if (!target.expanded && !target['_expanded']) {
          // clear children, because target node will load actual children on click
          target.children = [];
        }
      } else {
        this.data.splice(idx, 0, obj);
      }

      this.toDropListNodes();
    };

    syncWithPages(
      event.node[NODE_OBJECT_KEY],
      event.sourceContainerId,
      event.targetContainerId,
      event.index
    );

    const getParentId = (): number => {
      return Number(event.targetContainerId);
    };
    const getSiblingId = (): number => {
      const children = event.targetContainerId
        ? findNode(this.nodes, event.targetContainerId)?.children
        : this.nodes;

      const indexDirection = event.action === 'after' ? -1 : 1;
      const indexShifted = event.index + indexDirection;

      return Number(children[indexShifted]?.key);
    };

    const req = event.action !== 'inside'
      ? {siblingLinkId: getSiblingId(), action: event.action}
      : {parentLinkId: getParentId()};

    this.pageLinkService.moveLink(Number(event.node.key), req).subscribe(resp => {
      const obj: DragNode = event.node[NODE_OBJECT_KEY];
      obj.link = resp.find(l => l.targetId === obj.link.targetId) ?? obj.link;
      setTimeout(() => this.toDropListNodes());
    });
  }


  public onChildAdd(event: MouseEvent, modal: WikiPageModalComponent, node?: DropListNode): void {
    event.preventDefault();
    event.stopImmediatePropagation();
    modal.open({
      links: node ? [{
        sourceId: node[NODE_OBJECT_KEY].page.id,
        orderNumber: node.children.length + 1
      }] : []
    });
  }


  /* Page link API */

  protected search = (text: string): Observable<DragNode[]> => {
    if (!text) {
      return this.loadRoots();
    }

    return this.sidebarService.search(this.space?.id, text).pipe(tap(roots => {
      this.data = roots;
      this.toDropListNodes();
    }));
  };

  protected loadRoots = (): Observable<DragNode[]> => {
    return this.sidebarService.loadRoots(this.space?.id).pipe(tap(roots => {
      this.data = roots;
      this.toDropListNodes();
    }));
  };

  protected reload(): void {
    const collectExpandedPageIds = (nodes: DropListNode[]): number[] => {
      return nodes.filter(n => n.expanded).map(n => [n[NODE_OBJECT_KEY].page.id, ...collectExpandedPageIds(n.children)]).flat();
    };


    const restoreExpansion = (obj: DragNode, expandedPageIds: number[]): void => {
      const pageId = obj.page.id;
      if (!expandedPageIds.includes(pageId) || obj.expanded) {
        return;
      }

      this.loader.wrap('reload', this._expandBranch(obj)).subscribe(children => {
        remove(expandedPageIds, pageId);
        children.forEach(c => restoreExpansion(c, expandedPageIds));
      });
    };

    const expansionPageIds = collectExpandedPageIds(this.nodes);
    this.loadRoots().subscribe(() => {
      this.data.forEach(rootNode => restoreExpansion(rootNode, expansionPageIds));
    });
  }


  /* Expand API */

  protected _expandBranch(obj: DragNode): Observable<DragNode[]> {
    return this.sidebarService.findChildren(this.space?.id, obj.link.targetId).pipe(tap(children => {
      obj.children = children;
      obj.expanded = children.length > 0;
      obj['_expanded'] = true; // expanded via request, all OK, trustworthy children
      this.toDropListNodes();
    }));
  }

  private expandBranch(obj: DragNode): void {
    if (!obj['_expanded']) {
      // node was already expanded, its nodes are somewhere in the tree (still in node or dragged into other nodes)
      this._expandBranch(obj).subscribe();
    }
  }

  private expandPath(pageIdPath: number[], data: DragNode[], force = false): void {
    const obj = data.find(p => p.page.id === pageIdPath[0]);
    if (!obj) {
      return;
    }

    if (force) {
      obj['_expanded'] = false;
    }

    this.loader.wrap('expand', this._expandBranch(obj)).subscribe(() => {
      pageIdPath.shift();
      this.expandPath(pageIdPath, obj.children, force);
    });
  }


  /* Utils */

  protected toDropListNodes = (): void => {
    const mapper = (obj: DragNode): DropListNode => ({
      key: String(obj.link.id),
      expandable: obj.children?.length > 0 || !obj.leaf,
      expanded: obj.expanded,
      children: obj.children?.map(p => mapper(p)) || [],
      obj
    });

    this.nodes = this.data.map(obj => mapper(obj));
  };

  protected openPage(obj: Page): void {
    this.viewPage.emit(this.localizedContent(obj)?.slug);
  }

  protected openPageAfterSave(obj: Page, modal: WikiPageModalComponent): void {
    this.openPage(obj);

    obj.links.forEach(l => {
      const parentLinkId = this.findLinkId(l.sourceId, this.nodes);
      const parentLink = findNode(this.nodes, String(parentLinkId));
      // fixme: expandBranch should work, but it does not
      parentLink.expandable = true;
      parentLink.expanded = true;
    });

    modal.close();
    this.reload();
  }

  protected localizedContent = (page: Page): PageContent => {
    return page?.contents?.find(c => c.lang === this.translateService.currentLang) || page?.contents?.[0];
  };

  protected findLinkId = (pageId: number, nodes: DropListNode[]): number => {
    return findInTree(nodes, String(pageId), n => n[NODE_OBJECT_KEY].page.id, n => n.children)?.[NODE_OBJECT_KEY]?.link?.id;
  };
}
