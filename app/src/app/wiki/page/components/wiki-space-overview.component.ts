import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { LoadingManager, AbbreviatePipe, ApplyPipe, LocalDateTimePipe } from '@termx-health/core-util';
import {Space} from 'term-web/sys/_lib/space';
import {PageContent} from 'term-web/wiki/_lib';
import {PageService} from 'term-web/wiki/page/services/page.service';

import { MuiSkeletonModule, MuiCoreModule, MuiIconModule, MuiButtonModule, MuiDropdownModule } from '@termx-health/ui';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@termx-health/util';
import {saveAs} from 'file-saver';

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
    imports: [MuiSkeletonModule, MuiCoreModule, RouterLink, MuiIconModule, MuiButtonModule, MuiDropdownModule, TranslatePipe, MarinaUtilModule, AbbreviatePipe, ApplyPipe, LocalDateTimePipe]
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

  protected exportSpace(format: 'pdf' | 'html'): void {
    const req$ = this.pageService.exportWiki(format, this.space.id);
    this.loader.wrap('export', req$).subscribe(resp => {
      const fallback = `Wiki-${this.space?.code}.${format}`;
      saveAs(resp.body, this.parseFilename(resp.headers.get('Content-Disposition')) ?? fallback);
    });
  }

  private parseFilename(contentDisposition: string): string {
    return contentDisposition?.match(/filename=([^;]+)/)?.[1]?.trim().replace(/^"|"$/g, '') || undefined;
  }
}
