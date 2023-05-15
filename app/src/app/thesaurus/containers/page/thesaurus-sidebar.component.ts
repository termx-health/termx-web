import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {PageService} from '../../services/page.service';
import {catchError, debounceTime, distinctUntilChanged, map, Observable, of, Subject, switchMap} from 'rxjs';
import {Router} from '@angular/router';
import {compareValues} from '@kodality-web/core-util';
import {GithubExportable} from '../../../integration/_lib/github/github.service';
import {Page, PageContent, PageLink, PageSearchParams} from 'term-web/thesaurus/_lib';

@Component({
  selector: 'tw-thesaurus-sidebar',
  templateUrl: './thesaurus-sidebar.component.html',
  styles: [`
    .tw-page-active-item ::ng-deep {
      .ant-btn-link, .ant-collapse-header {
        color: black;
      }
    }

    .tw-page-draft-item ::ng-deep {
      .ant-btn-link, .ant-collapse-header {
        color: grey;
      }
    }

    .tw-page-collapse ::ng-deep {
      .ant-collapse-header {
        align-items: center;
        padding: 0;
      }

      .ant-collapse-content-box {
        padding-bottom: 0 !important;
        padding-top: 0 !important;
      }
    }
  `]
})
export class ThesaurusSidebarComponent implements OnInit, OnChanges {
  public pages: Page[] = [];
  public searchInput?: string;
  public searchUpdate = new Subject<string>();
  public modalVisible: boolean = false;

  public readonly DEFAULT_CONCEPT_LIMIT = 100;

  @Input() public path?: number[];

  public constructor(
    private router: Router,
    private translateService: TranslateService,
    private pageService: PageService
  ) { }

  public ngOnInit(): void {
    this.loadPages();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.searchPages()),
    ).subscribe(data => this.pages = data);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['path'] && this.path) {
      this.expandPath(this.path, this.pages);
    }
  }

  public loadPages(): void {
    this.searchPages().subscribe(resp => this.pages = resp);
  }

  public searchPages(): Observable<Page[]> {
    const q = new PageSearchParams();
    q.textContains = this.searchInput || undefined;
    q.root = !this.searchInput || undefined;
    q.limit = this.DEFAULT_CONCEPT_LIMIT;
    return this.pageService.searchPages(q).pipe(map(r => r.data));
  }

  public loadPageChildren(page: Page, loadChildren: boolean): void {
    this.router.navigate(['/thesaurus/pages/', this.localizedContent(page)?.slug]);

    if (!loadChildren) {
      return;
    }
    this.searchChildren(page.id!)
      .subscribe(pages => page.linkPages = pages.sort((p1, p2) =>
        compareValues(this.findOrderNumber(p1.links!, page.id!), this.findOrderNumber(p2.links!, page.id!))));
  }

  private findOrderNumber(links: PageLink[], pageId: number): number {
    return links!.find(l => l.sourceId === pageId)?.orderNumber || -1;
  }

  public searchChildren(rootId: number): Observable<Page[]> {
    const q = new PageSearchParams();
    q.rootId = rootId;
    q.limit = this.DEFAULT_CONCEPT_LIMIT;
    return this.pageService.searchPages(q).pipe(map(r => r.data), catchError(() => of([])));
  }

  public localizedContent = (page: Page): PageContent | undefined => {
    return page?.contents?.find(c => c.lang === this.translateService.currentLang) || page?.contents?.[0];
  };

  public openPage(page: Page): void {
    const content = this.localizedContent(page);
    this.modalVisible = false;
    this.router.navigate(['/thesaurus/pages/', content!.slug]);
  }

  public openPageContent(content: PageContent): void {
    this.modalVisible = false;
    this.router.navigate(['/thesaurus/pages/', content.slug, 'edit']);
  }

  private expandPath(path: number[], pages: Page[]): void {
    const page = pages.find(p => p.id === path[0]);
    if (!page) {
      return;
    }

    page.active = page.active || path.length > 1;
    path.shift();
    if (page.linkPages) {
      this.expandPath(path, page.linkPages);
    } else {
      this.searchChildren(page.id!).subscribe(children => {
        page.linkPages = children.sort((p1, p2) => compareValues(this.findOrderNumber(p1.links!, page.id!), this.findOrderNumber(p2.links!, page.id!)));
        this.expandPath(path, page.linkPages);
      });
    }
  }

  public getLinkStyle = (page: Page): string | undefined => {
    if (page.status === 'active') {
      return 'tw-page-active-item';
    }
    return 'tw-page-draft-item';
  };

  public prepareExport = (): GithubExportable[] => {
    //FIXME: add sub-pages with filename containing parent page names
    return this.pages.filter(p => p.contents?.[0].content).map(p => {
      let content = p.contents?.[0];
      let filename = `${content?.slug}.${content?.contentType === 'markdown' ? 'md' : 'html'}`;
      return {content: content?.content, filename: filename};
    });
  };
}
