import {Component, Input} from '@angular/core';
import {Page, PageContent} from '../../_lib';

@Component({
  selector: 'tw-thesaurus-page-header',
  templateUrl: 'thesaurus-page-header.component.html'
})
export class ThesaurusPageHeaderComponent {
  @Input() public page: Page;
  @Input() public slug: string;

  protected author(p: Page): {by: string, at: Date} {
    return p.modifiedAt
      ? {by: p.modifiedBy, at: p.modifiedAt}
      : {by: p.createdBy, at: p.createdAt};
  }

  protected getContent = (page: Page, slug: string): PageContent => {
    return page?.contents?.find(c => c.slug === slug) || page?.contents?.[0];
  };
}
