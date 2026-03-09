import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PageContent} from 'term-web/wiki/_lib';

import { MuiIconButtonModule } from '@kodality-web/marina-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { ApplyPipe, LocalDateTimePipe } from '@kodality-web/core-util';

@Component({
    selector: 'tw-wiki-page-header',
    templateUrl: 'wiki-page-header.component.html',
    imports: [MuiIconButtonModule, TranslatePipe, ApplyPipe, LocalDateTimePipe]
})
export class WikiPageHeaderComponent {
  @Input() public pageContent: PageContent;
  @Input() public slug: string;
  @Output() public viewHistory = new EventEmitter();

  protected author(pc: PageContent): {by: string, at: Date} {
    if (pc.modifiedAt) {
      return {by: pc.modifiedBy, at: pc.modifiedAt};
    } else if (pc.createdAt) {
      return {by: pc.createdBy, at: pc.createdAt};
    }
  }
}
