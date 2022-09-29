import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Page} from 'terminology-lib/thesaurus/model/page';
import {PageContent} from 'terminology-lib/thesaurus/model/page-content';
import {TranslateService} from '@ngx-translate/core';
import {ThesaurusService} from '../services/thesaurus.service';
import {catchError, debounceTime, distinctUntilChanged, map, Observable, of, Subject, switchMap} from 'rxjs';
import {PageSearchParams} from 'terminology-lib/thesaurus';
import {Router} from '@angular/router';

@Component({
  selector: 'twa-thesaurus-sidebar',
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
    private thesaurusService: ThesaurusService
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
    return this.thesaurusService.searchPages(q).pipe(map(r => r.data));
  }

  public loadPageChildren(page: Page, loadChildren: boolean): void {
    this.router.navigate(['/thesaurus/', this.localizedContent(page)?.slug]);

    if (!loadChildren) {
      return;
    }
    this.searchChildren(page.id!).subscribe(pages => page.relationPages = pages);
  }

  public searchChildren(rootId: number): Observable<Page[]> {
    const q = new PageSearchParams();
    q.rootId = rootId;
    q.limit = this.DEFAULT_CONCEPT_LIMIT;
    return this.thesaurusService.searchPages(q).pipe(map(r => r.data), catchError(() => of([])));
  }

  public localizedContent = (page: Page): PageContent | undefined => {
    return page?.contents?.find(c => c.lang === this.translateService.currentLang) || page?.contents?.[0];
  };

  public openPage(page: Page): void {
    const content = this.localizedContent(page);
    this.modalVisible = false;
    this.router.navigate(['/thesaurus/', content!.slug]);
  }

  public openPageContent(content: PageContent): void {
    this.modalVisible = false;
    this.router.navigate(['/thesaurus/', content.slug]);
  }

  private expandPath(path: number[], pages: Page[]): void {
    const page = pages.find(p => p.id === path[0]);
    if (!page) {
      return;
    }

    page.active = page.active || path.length > 1;
    path.shift();
    if (page.relationPages) {
      this.expandPath(path, page.relationPages);
    } else {
      this.searchChildren(page.id!).subscribe(children => {
        page.relationPages = children;
        this.expandPath(path, page.relationPages);
      });
    }
  }

  public getLinkStyle = (page: Page): string | undefined => {
    if (page.status === 'active') {
      return 'tw-page-active-item';
    }
    return 'tw-page-draft-item';
  };
}
