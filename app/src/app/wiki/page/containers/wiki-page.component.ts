import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PageService} from '../services/page.service';
import {DestroyService, LoadingManager} from '@kodality-web/core-util';
import {Page} from 'term-web/wiki/_lib';
import {map, takeUntil} from 'rxjs';
import {Space} from 'term-web/space/_lib';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {WikiSpaceService} from 'term-web/wiki/page/services/wiki-space.service';
import {CodeName} from '@kodality-web/marina-util';
import {TranslateService} from '@ngx-translate/core';

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

  protected spaces: CodeName[] = [];
  protected loader = new LoadingManager();

  public constructor(
    protected translateService: TranslateService,
    protected preferences: PreferencesService,
    private spaceService: WikiSpaceService,
    private pageService: PageService,
    private router: Router,
    private route: ActivatedRoute,
    private destroy$: DestroyService,
  ) { }


  public ngOnInit(): void {
    this.loader.wrap('spaces', this.spaceService.loadSpaces()).subscribe(resp => {
      this.spaces = resp;

      this.route.paramMap.subscribe(params => {
        const space = params.get("space"); // could be either code or id

        const matchedSpace = resp.find(s => s.code === space) || resp.find(s => s.id === Number(space));
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
    }
  }


  /* Link open */

  public viewRoot(): void {
    this.router.navigate(['/wiki', this.activeSpace]);
  }

  public viewPage(slug: string): void {
    this.router.navigate(['/wiki', this.activeSpace, slug]);
  }

  public editPage(slug: string): void {
    this.router.navigate(['/wiki', this.activeSpace, slug, 'edit']);
  }

  public viewResource({type, id, opts}: {type: string, id: string, opts: any}): void {
    const handlers = {
      'page': () => this.router.navigate(['/wiki', opts['space'] ?? this.activeSpace, id]),
      'cs': () => this.router.navigate(['/resources/code-systems/', id, 'summary']),
      'vs': () => this.router.navigate(['/resources/value-sets/', id, 'summary']),
      'ms': () => this.router.navigate(['/resources/map-sets/', id, 'view']),
      'concept': () => {
        const [cs, concept] = id.split('|');
        if (cs === 'snomed-ct') {
          this.router.navigate(['/integration/snomed/dashboard/', concept]);
        } else {
          this.router.navigate(['/resources/code-systems/', cs, 'concepts', concept, 'view']);
        }
      },
    };

    handlers[type]?.();
  }

  public viewHistory(): void {
    this.router.navigate(['/wiki', this.activeSpace, this.slug, 'history']);
  }


  /* Utils */

  protected get isOverviewSelected(): boolean {
    return !this.route.snapshot.paramMap.has('slug');
  }

  protected get activeSpace(): string | number {
    return this.space.code ?? this.preferences.spaceId;
  }
}
