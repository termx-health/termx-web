import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { LoadingManager, AbbreviatePipe, ApplyPipe, LocalDateTimePipe } from '@kodality-web/core-util';
import {Space} from 'term-web/sys/_lib/space';
import {PageContent} from 'term-web/wiki/_lib';
import {PageService} from 'term-web/wiki/page/services/page.service';

import { MuiSkeletonModule, MuiCoreModule, MuiIconModule } from '@kodality-web/marina-ui';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';

@Component({
    selector: 'tw-wiki-space-overview',
    templateUrl: 'wiki-space-overview.component.html',
    styles: [`
    .equal-columns {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
      gap: 1rem;
    }
  `],
    imports: [MuiSkeletonModule, MuiCoreModule, RouterLink, MuiIconModule, TranslatePipe, MarinaUtilModule, AbbreviatePipe, ApplyPipe, LocalDateTimePipe]
})
export class WikiSpaceOverviewComponent implements OnChanges {
  private pageService = inject(PageService);

  @Input() public space: Space;
  @Input() public lang: string;
  @Input() public viewPageRoute: (_slug: string) => any[];

  protected totalPages: number;
  protected recentlyModified: PageContent[] = [];
  protected loader = new LoadingManager();

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
