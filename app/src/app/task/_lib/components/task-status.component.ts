import {Component, Input} from '@angular/core';
import {BooleanInput} from '@kodality-web/core-util';
import { AsyncPipe } from '@angular/common';
import { MuiTagModule, MuiIconModule } from '@kodality-web/marina-ui';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';

@Component({
    selector: 'tw-task-status',
    templateUrl: './task-status.component.html',
    host: { style: 'display: inline-flex' },
    imports: [MuiTagModule, MuiIconModule, AsyncPipe, LocalizedConceptNamePipe]
})
export class TaskStatusComponent {
  @Input() public status?: string;
  @Input() @BooleanInput() public editMode: string | boolean;

  public statusMap: {[status: string]: string} = {
    'draft': 'warning',
    'requested': 'warning',
    'received': 'warning',
    'accepted': 'success',
    'rejected': 'error',
    'ready': 'success',
    'cancelled': 'error',
    'in-progress': 'warning',
    'on-hold': 'warning',
    'failed': 'error',
    'completed': 'success',
    'entered-in-error': 'error'
  };
}
