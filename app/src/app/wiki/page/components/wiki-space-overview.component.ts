import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {Space} from 'term-web/space/_lib';
import {PageContent} from 'term-web/wiki/_lib';
import {PageService} from '../services/page.service';

@Component({
  selector: 'tw-wiki-space-overview',
  templateUrl: 'wiki-space-overview.component.html',
  styles: [`
    .equal-columns {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
      gap: 1rem;
    }
  `]
})
export class WikiSpaceOverviewComponent implements OnChanges {
  @Input() public space: Space;
  @Input() public lang: string;
  @Input() public viewPageRoute: (_slug: string) => any[];

  protected totalPages: number;
  protected recentlyModified: PageContent[] = [];
  protected loader = new LoadingManager();

  public constructor(
    private pageService: PageService,
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['space'] || changes['lang']) {
      this.recentlyModified = [];

      if (this.space) {
        this.loader.wrap('pages', this.pageService.searchPages({
          spaceIds: String(this.space?.id),
          limit: 0
        })).subscribe(resp => {
          this.totalPages = resp.meta.total;
        });

        this.loader.wrap('recent', this.pageService.searchPageContents({
          spaceIds: String(this.space?.id),
          limit: 6,
          sort: '-modified'
        })).subscribe(resp => {
          this.recentlyModified = resp.data;
        });
      }
    }
  }
}
