import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PageService} from '../services/page.service';
import {compareStrings, DestroyService, LoadingManager} from '@kodality-web/core-util';
import {Page} from 'term-web/wiki/_lib';
import {map, takeUntil} from 'rxjs';
import {Space} from 'term-web/space/_lib';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {WikiSpace, WikiSpaceService} from 'term-web/wiki/page/services/wiki-space.service';
import {TranslateService} from '@ngx-translate/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {AuthService} from 'term-web/core/auth';
import {SeoService} from 'term-web/core/ui/services/seo.service';

@Component({
  templateUrl: './wiki-page.component.html',
  styleUrls: ['../styles/wiki-page.styles.less'],
  providers: [DestroyService]
})
export class WikiPageComponent implements OnInit {
  public space?: Space;
  public slug?: string;
  public page?: Page;
  public path?: number[];

  protected spaces: WikiSpace[] = [];
  protected loader = new LoadingManager();
  protected mobileQuery: MediaQueryList;

  public constructor(
    protected auth: AuthService,
    protected translateService: TranslateService,
    protected preferences: PreferencesService,
    private spaceService: WikiSpaceService,
    private pageService: PageService,
    protected router: Router,
    private route: ActivatedRoute,
    private destroy$: DestroyService,
    private seo: SeoService,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 992px)');
  }


  public ngOnInit(): void {
    this.loader.wrap('spaces', this.spaceService.loadSpaces()).subscribe(spaces => {
      this.spaces = spaces.sort((a, b) => (a.active ? -1 : 0) - (b.active ? -1 : 0) || compareStrings(a.code, b.code));

      this.route.paramMap.subscribe(params => {
        const space = params.get("space"); // could be either code or id

        const matchedSpace = spaces.find(s => s.code === space) || spaces.find(s => s.id === Number(space));
        if (!matchedSpace) {
          // param does not match any of loaded spaces
          if (this.preferences.spaceId) {
            // fallback to previously selected space (in case of navigating to '/wiki/')
            this.router.navigate(['/wiki', this.preferences.spaceId], {replaceUrl: true});
          }
          return;
        }

        const foundById = matchedSpace.code !== space;
        if (foundById) {
          // replace id with code
          const url = this.router.url.replace(`/${matchedSpace.id}`, `/${matchedSpace.code}`);
          this.router.navigateByUrl(url, {replaceUrl: true});
        } else {
          this.space = matchedSpace;
          this.preferences.setSpace(matchedSpace.id, {emitEvent: false});
        }


        const slug = params.get("slug");
        if (slug) {
          const req$ = this.pageService.searchPages({slugs: slug, spaceIds: matchedSpace.id, limit: 1}).pipe(map(r => r.data[0]));
          this.loader.wrap('init', req$).subscribe(page => {
            if (page) {
              this.init(page, slug);
            } else {
              this.router.navigate(['/wiki']);
            }
          });
        } else {
          this.init();
        }
      });
    });

    this.preferences.spaceId$.pipe(takeUntil(this.destroy$)).subscribe(spaceId => {
      this.router.navigate(['/wiki', spaceId], {replaceUrl: true});
    });
  }

  private init(page?: Page, slug?: string): void {
    this.page = page;
    this.slug = slug;

    if (page) {
      this.loader.wrap('path', this.pageService.getPath(page.id)).subscribe(path => this.path = path);

      const content = page.contents.find(c => c.slug === slug);
      this.seo.title(content?.name);
      this.seo.description(content?.content?.slice(0, 1000));
    } else {
      this.seo.reset();
      this.seo.title(this.translateService.instant('web.wiki-page.overview.pages') + ' - ' + this.space?.code ?? '');
    }
  }


  /* Link Routes */

  public viewRootRoute = (): any[] => {
    return ['/wiki', this.activeSpace];
  };

  public viewPageRoute = (slug: string): any[] => {
    return ['/wiki', this.activeSpace, slug];
  };

  public viewResourceRoute = ({type, id, options}: {type: string, id: string, options: {space?: string}}): any[] => {
    const handlers = {
      'page': () => (['/wiki', options['space'] ?? this.activeSpace, id]),
      'cs': () => (['/resources/code-systems/', id, 'summary']),
      'csc': () => (['/resources/code-systems/', id, 'concepts']),
      'vs': () => (['/resources/value-sets/', id, 'summary']),
      'vsc': () => (['/resources/value-sets/', id.split('|')[0], 'versions', id.split('|')[1], 'concepts']),
      'ms': () => ['/resources/map-sets/', id, 'view'],
      'concept': () => {
        const [cs, concept] = id.split('|');
        if (cs === 'snomed-ct') {
          return ['/integration/snomed/dashboard/', concept];
        } else {
          if (this.auth.hasAnyPrivilege([cs + '.CodeSystem.edit'])) {
            return ['/resources/code-systems/', cs, 'concepts', concept, 'edit'];
          }
          return ['/resources/code-systems/', cs, 'concepts', concept, 'view'];
        }
      },
    };

    return handlers[type]?.() ?? ['.'];
  };

  public viewHistoryRoute = (): any[] => {
    return ['/wiki', this.activeSpace, this.slug, 'history'];
  };

  public editPageRoute(slug: string): any[] {
    return ['/wiki', this.activeSpace, slug, 'edit'];
  }


  /* Utils */

  protected get isOverviewSelected(): boolean {
    return !this.route.snapshot.paramMap.has('slug');
  }

  protected get activeSpace(): string | number {
    return this.space.code ?? this.preferences.spaceId;
  }
}
