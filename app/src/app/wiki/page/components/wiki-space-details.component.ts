import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {PageService} from '../services/page.service';
import {Space} from 'term-web/space/_lib';
import {Page, PageContent} from 'term-web/wiki/_lib';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'tw-wiki-space-details',
  templateUrl: 'wiki-space-details.component.html',
  styles: [`
    .equal-columns {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
      gap: 1rem;
    }
  `]
})
export class WikiSpaceDetailsComponent implements OnChanges {
  @Input() public space: Space;
  @Output() public viewPage = new EventEmitter<string>();

  protected totalPages: number;
  protected recentlyModified: Page[] = [];

  public constructor(
    private pageService: PageService,
    private translateService: TranslateService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['space']) {
      this.recentlyModified = [];

      if (this.space) {
        this.pageService.searchPages({spaceIds: String(this.space?.id), limit: 5, sort: '-modified'}).subscribe(resp => {
          this.totalPages = resp.meta.total;
          this.recentlyModified = resp.data;
        });
      }
    }
  }

  protected localizedContent = (page: Page): PageContent => {
    return page?.contents?.find(c => c.lang === this.translateService.currentLang) || page?.contents?.[0];
  };
}
