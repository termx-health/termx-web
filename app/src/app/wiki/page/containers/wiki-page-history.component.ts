import {Clipboard} from '@angular/cdk/clipboard';
import {Location} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {isDefined, isNil, LoadingManager} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {OutputFormatType} from 'diff2html/lib/types';
import {NzTimelineItemColor} from 'ng-zorro-antd/timeline/typings';
import {map, Observable, tap} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import {SeoService} from 'term-web/core/ui/services/seo.service';
import {Space} from 'term-web/space/_lib';
import {Page, PageContent} from 'term-web/wiki/_lib';
import {PageContentHistoryItem} from 'term-web/wiki/_lib/page/models/page-content-history-item';
import {WikiSpaceService} from 'term-web/wiki/page/services/wiki-space.service';
import {PageService} from '../services/page.service';

@Component({
  templateUrl: 'wiki-page-history.component.html',
  styleUrls: ['../styles/wiki-page.styles.less'],
})
export class WikiPageHistoryComponent implements OnInit {
  protected space?: Space;
  protected slug?: string;
  protected pageContent?: PageContent;

  protected historyTotal: number;
  protected history: PageContentHistoryItem[] = [];

  protected sourceItem: PageContentHistoryItem;
  protected targetItem: PageContentHistoryItem;

  protected viewMode: OutputFormatType = 'line-by-line';
  protected viewSource: boolean;

  protected loader = new LoadingManager();

  public constructor(
    public auth: AuthService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private clipboard: Clipboard,
    private pageService: PageService,
    private translate: TranslateService,
    private spaceService: WikiSpaceService,
    private seo: SeoService,
  ) { }


  public ngOnInit(): void {
    this.loader.wrap('spaces', this.spaceService.loadSpaces()).subscribe(spaces => {
      this.route.paramMap.subscribe(params => {
        const spaceCode = params.get("space"); // could be either code or id
        const space = this.space = spaces.find(s => s.code === spaceCode);
        const slug = this.slug = params.get("slug");

        this.loader.wrap('init', this.pageService.searchPages({spaceIds: space.id, slugs: slug, limit: 1}))
          .pipe(map(r => r.data[0]))
          .subscribe(page => {
            if (page) {
              this.init(page, slug);
            } else {
              this.location.back();
            }
          });
      });
    });
  }

  private init(page?: Page, slug?: string): void {
    this.pageContent = page.contents.find(c => c.slug === slug);
    this.queryNext();

    this.seo.title(this.translate.instant('web.wiki-page.history.timeline.header') + ' - ' + this.pageContent.name);
  }

  private _queryNext(): Observable<any> {
    const {pageId, id} = this.pageContent;
    return this.loader.wrap('history', this.pageService.loadPageContentHistory(pageId, id, {offset: this.history.length, limit: 12})).pipe(tap(resp => {
      this.historyTotal = resp.meta.total;
      this.history = [...this.history, ...resp.data];
    }));
  }

  protected queryNext(): void {
    if (this.history.length >= this.historyTotal) {
      return;
    }

    this._queryNext().subscribe(() => {
      this.targetItem ??= this.history[0];
      this.sourceItem ??= this.history[1];

      const params = this.route.snapshot.queryParamMap;
      let queryNext = false;
      if (params.has('target')) {
        this.targetItem = this.history.find(hi => hi.id === Number(params.get('target')));
        queryNext ||= isNil(this.targetItem);
      }
      if (params.has('source')) {
        this.sourceItem = this.history.find(hi => hi.id === Number(params.get('source')));
        queryNext ||= isNil(this.sourceItem);
      }
      if (queryNext) {
        this.queryNext();
      }

      if (this.historyTotal === 1) {
        this.viewSource = true;
      }
    });
  }


  /* Internal API */

  protected setSource(hi: PageContentHistoryItem): void {
    this.sourceItem = hi;
    this.viewSource = false;
    this.mergeQueryParams({source: hi.id});
  }

  protected setTarget(hi: PageContentHistoryItem): void {
    const idx = this.history.indexOf(hi);
    this.targetItem = hi;
    if (idx >= this.history.indexOf(this.sourceItem)) {
      this.sourceItem = this.history[idx + 1] ?? hi;
    }
    this.mergeQueryParams({target: hi.id});
    this.viewSource = false;
  }

  protected move(dir: -1 | 1): void {
    const nextSource = this.history[this.history.indexOf(this.sourceItem) + dir];
    const nextTarget = this.history[this.history.indexOf(this.targetItem) + dir];

    if (dir === 1 && isNil(nextSource) && this.history.length < this.historyTotal) {
      this._queryNext().subscribe(() => this.move(1));
    }

    if (isDefined(nextSource) && isDefined(nextTarget)) {
      this.sourceItem = nextSource;
      this.targetItem = nextTarget;
    }
  }

  protected copy(): void {
    this.clipboard.copy(this.targetItem.content);
  }


  /* Utils */

  private mergeQueryParams(queryParams: object): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  protected getDotColor = (item: PageContentHistoryItem, pageContent: PageContent): NzTimelineItemColor => {
    if (item.modifiedAt === pageContent.modifiedAt) {
      return 'green';
    }
    if ((item.modifiedBy ?? item.createdBy) === this.auth.user?.username) {
      return 'blue';
    }
    return 'gray';
  };
}
