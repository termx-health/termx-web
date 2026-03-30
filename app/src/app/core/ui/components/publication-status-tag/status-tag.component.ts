import {Component, Input} from '@angular/core';
import { BooleanInput } from '@termx-health/core-util';
import { MuiTagModule } from '@termx-health/ui';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-status-tag',
    templateUrl: './status-tag.component.html',
    host: { style: 'display: inline-flex' },
    imports: [MuiTagModule, AsyncPipe, UpperCasePipe, LocalizedConceptNamePipe]
})
export class StatusTagComponent {
  @Input() public status?: string;
  @Input() @BooleanInput() public compact: boolean | string = false;
  @Input() public extraText?: string;

  public statusMap: {[status: string]: string} = {
    'active': 'success',
    'draft': 'warning',
    'retired': 'error'
  };
}
