import {Component, Input} from '@angular/core';
import { MuiTagModule } from '@kodality-web/marina-ui';
import { AsyncPipe } from '@angular/common';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-status-tag',
    templateUrl: './status-tag.component.html',
    host: { style: 'display: inline-flex' },
    imports: [MuiTagModule, AsyncPipe, LocalizedConceptNamePipe]
})
export class StatusTagComponent {
  @Input() public status?: string;

  public statusMap: {[status: string]: string} = {
    'active': 'success',
    'draft': 'warning',
    'retired': 'error'
  };
}
