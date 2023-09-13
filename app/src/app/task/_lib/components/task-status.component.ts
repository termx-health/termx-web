import {Component, Input} from '@angular/core';
import {BooleanInput} from '@kodality-web/core-util';

@Component({
  selector: 'tw-task-status',
  templateUrl: './task-status.component.html',
  host: {style: 'display: inline-flex'}
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
