import {Component, Injectable, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {PageService} from '../../services/page.service';
import {forkJoin, map, mergeMap, Observable, of, tap} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {compareValues, copyDeep, LoadingManager, SearchResult, unique} from '@kodality-web/core-util';
import {Page, PageContent, PageLink} from 'term-web/thesaurus/_lib';
import {DropListMoveEvent, DropListNode} from 'term-web/core/ui/components/drop-list/drop-list.component';
import {PageLinkService} from 'term-web/thesaurus/services/page-link.service';
import {ThesaurusPageModalComponent} from 'term-web/thesaurus/containers/page/thesaurus-page-modal.component';

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
class ThesaurusSidebarService {
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
    private pageLinkService: PageLinkService
  ) { }

  public search(text: string): Observable<DragNode[]> {
    return this.pageService.searchPages({
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

  public loadRoots(): Observable<DragNode[]> {
    return this.pageLinkService.search({
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

  public findChildren(sourceId: number): Observable<DragNode[]> {
    return this.pageLinkService
      .search({
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


@Component({
  selector: 'tw-thesaurus-sidebar',
  templateUrl: './thesaurus-sidebar.component.html',
  providers: [ThesaurusSidebarService]
})
export class ThesaurusSidebarComponent implements OnInit, OnChanges {
  @Input() public path?: number[];

  protected data: DragNode[] = [];
  protected searchText: string;

  protected selectedKey: string;
  protected nodes: DropListNode[] = [];
  private NODE_OBJECT_KEY = 'obj';

  protected loader = new LoadingManager();

  public constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private pageLinkService: PageLinkService,
    private megaService: ThesaurusSidebarService
  ) { }


  public ngOnInit(): void {
    this.loadRoots().subscribe(() => {
      if (this.path) {
        // fixme: could be in ngOnChanges, but need a way for ngOnChange to wait until roots loaded
        this.expandPath(copyDeep(this.path), this.data);
        this.selectedKey = this.path?.length ? String(this.path[this.path.length - 1]) : this.selectedKey;
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['path'] && this.path?.length) {
      this.selectedKey = this.path?.length ? String(this.path[this.path.length - 1]) : this.selectedKey;
    }
  }


  /* Drop list API */

  protected onExpand(node: DropListNode): void {
    const obj: DragNode = node[this.NODE_OBJECT_KEY];
    obj.expanded = node.expanded;
    this.expandBranch(obj);
  }

  protected onSelect(node: DropListNode): void {
    const obj: DragNode = node[this.NODE_OBJECT_KEY];
    this.openPage(obj.page);

    if (!obj.leaf && !obj.expanded) {
      obj.expanded = true;
      this.expandBranch(obj);
    }
  }

  protected onMove(event: DropListMoveEvent): void {
    const syncWithPages = (obj: DragNode, sourceContainerId: string, targetContainerId: string, idx: number): void => {
      if (sourceContainerId) {
        const source = findDragNode(this.data, Number(sourceContainerId));
        source.children ??= [];
        source.children = source.children.filter(lp => lp.link.id !== obj.link.id);

        if (source.expanded) {
          // page was expanded, it is safe to assume all pages were loaded already
          // if no linked pages exists, we could assume that page is the leaf node
          source.leaf = !source.children.length;
        }
      } else {
        this.data = this.data.filter(lp => lp.link.id !== obj.link.id);
      }

      if (targetContainerId) {
        const target = findDragNode(this.data, Number(targetContainerId));
        target.children ??= [];
        target.children.splice(idx, 0, obj);

        if (!target.expanded) {
          // if page was not yet expanded, we can precalculate its leaf status
          // when user will expand the page, the actual result will be loaded
          target.leaf = target.children.length > 0;
        }
        // if (!target.leaf) {
        //   target.expanded = true
        // }
      } else {
        this.data.splice(idx, 0, obj);
      }

      this.toDropListNodes();
    };

    syncWithPages(
      event.node[this.NODE_OBJECT_KEY],
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
      const obj: DragNode = event.node[this.NODE_OBJECT_KEY];
      obj.link = resp.find(l => l.targetId === obj.link.targetId) ?? obj.link;
      setTimeout(() => this.toDropListNodes());
    });
  }


  public onChildAdd(event: MouseEvent, node: DropListNode, modal: ThesaurusPageModalComponent): void {
    event.preventDefault();
    event.stopImmediatePropagation();
    modal.open({
      links: [{
        sourceId: node[this.NODE_OBJECT_KEY].page.id,
        orderNumber: node.children.length + 1
      }]
    });
  }

  /* Page link API */

  protected search = (text: string): Observable<any> => this.megaService.search(text).pipe(tap(roots => {
    this.data = roots;
    this.toDropListNodes();
  }));

  protected loadRoots = (): Observable<DragNode[]> => this.megaService.loadRoots().pipe(tap(roots => {
    this.data = roots;
    this.toDropListNodes();
  }));

  protected reload(): void {
    const findPaths = (nodes: DropListNode[]): DropListNode[][] => {
      // fixme: only the first branch inside of root node is collected
      return nodes.filter(n => n.expanded).map(n => [n, ...findPaths(n.children).flat()]);
    };

    const paths = findPaths(this.nodes);
    this.loadRoots().subscribe(() => {
      paths.forEach(path => {
        this.expandPath(path.map(n => n[this.NODE_OBJECT_KEY].link.targetId), this.data, true);
      });
    });
  }


  /* Expand API */

  private expandBranch(obj: DragNode): void {
    if (obj['_expanded']) {
      return;
    }

    this.megaService.findChildren(obj.link.targetId).subscribe(children => {
      obj.children = children;
      obj['_expanded'] = true;
      this.toDropListNodes();
    });
  }

  private expandPath(pageIdPath: number[], data: DragNode[], force = false): void {
    const obj = data.find(p => p.page.id === pageIdPath[0]);
    if (!obj) {
      return;
    }

    obj.expanded ??= pageIdPath.length >= 1;
    pageIdPath.shift();

    if (!force && obj.children?.length) {
      return;
    }

    this.loader.wrap('expand', this.megaService.findChildren(obj.link.targetId)).subscribe(children => {
      obj.children = children;
      this.expandPath(pageIdPath, obj.children, force);
      this.toDropListNodes();
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
    this.router.navigate(['/thesaurus/pages', this.localizedContent(obj)?.slug]);
  }

  protected openPageAfterSave(obj: Page, modal: ThesaurusPageModalComponent): void {
    this.router.navigate(['/thesaurus/pages', this.localizedContent(obj)?.slug]).then(() => {
      obj.links.forEach(l => {
        const parentLinkId = this.findLinkId(l.sourceId, this.nodes);
        const parentLink = findNode(this.nodes, String(parentLinkId));
        // fixme: expandBranch should work, but it does not
        parentLink.expandable = true;
        parentLink.expanded = true;
      });

      modal.close();
      this.reload();
    });
  }

  protected localizedContent = (page: Page): PageContent => {
    return page?.contents?.find(c => c.lang === this.translateService.currentLang) || page?.contents?.[0];
  };

  protected findLinkId = (pageId: number, nodes: DropListNode[]): number => {
    return findInTree(nodes, String(pageId), n => n[this.NODE_OBJECT_KEY].page.id, n => n.children)?.[this.NODE_OBJECT_KEY]?.link?.id;
  };
}
