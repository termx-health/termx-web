import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PageService} from '../services/page.service';
import {LoadingManager} from '@kodality-web/core-util';
import {Page} from 'term-web/thesaurus/_lib';
import {map, skip} from 'rxjs';
import {Space, SpaceLibService} from 'term-web/space/_lib';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';

@Component({
  templateUrl: './thesaurus-page.component.html',
  styleUrls: ['../styles/thesaurus-page.styles.less']
})
export class ThesaurusPageComponent implements OnInit {
  public space?: Space;
  public page?: Page;
  public path?: number[];

  protected spaces: Space[] = [];
  protected loader = new LoadingManager();

  public constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pageService: PageService,
    private spaceService: SpaceLibService,
    protected preferences: PreferencesService,
  ) { }


  public ngOnInit(): void {
    this.loader.wrap('spaces', this.spaceService.search({})).subscribe(resp => {
      this.spaces = resp.data;

      this.route.paramMap.subscribe(params => {
        const space = params.get("space"); // could be either code or id

        const matchedSpace = resp.data.find(s => s.code === space) || resp.data.find(s => s.id === Number(space));
        if (!matchedSpace) {
          if (this.preferences.spaceId) {
            this.router.navigate(['/thesaurus', this.preferences.spaceId], {replaceUrl: true});
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
          this.preferences.setSpace(matchedSpace.id);
        }


        const slug = params.get("slug");
        if (slug) {
          const req$ = this.pageService.searchPages({slugs: this.slug, spaceIds: matchedSpace.id, limit: 1}).pipe(map(r => r.data[0]));
          this.loader.wrap('init', req$).subscribe(page => {
            if (page) {
              this.init(page);
            } else {
              this.router.navigate(['/thesaurus']);
            }
          });
        } else {
          this.init();
        }
      });

      this.preferences.spaceId$.pipe(
        skip(1), // fixme: service emits the undefined/localstorage value first
      ).subscribe(spaceId => {
        this.router.navigate(['/thesaurus', spaceId]);
      });
    });
  }

  private init(page?: Page): void {
    this.page = page;
    if (page) {
      this.loader.wrap('path', this.pageService.getPath(page.id)).subscribe(path => this.path = path);
    }
  }


  /* Link open */

  public viewRoot(): void {
    this.router.navigate(['/thesaurus', this.space.code ?? this.preferences.spaceId]);
  }

  public viewPage(slug: string): void {
    this.router.navigate(['/thesaurus', this.space.code ?? this.preferences.spaceId, slug]);
  }

  public editPage(slug: string): void {
    this.router.navigate(['/thesaurus', this.space.code ?? this.preferences.spaceId, slug, 'edit']);
  }

  public viewTarget({type, id}: {type: string, id: string}): void {
    const handlers = {
      'page': () => this.router.navigate(['/thesaurus', this.space.code ?? this.preferences.spaceId, id]),
      'cs': () => this.router.navigate(['/resources/code-systems/', id, 'view']),
      'vs': () => this.router.navigate(['/resources/value-sets/', id, 'view']),
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


  /* Utils */

  protected get isOverviewSelected(): boolean {
    return !this.route.snapshot.paramMap.has('slug');
  }

  protected get slug(): string {
    return this.route.snapshot.paramMap.get('slug');
  }
}
