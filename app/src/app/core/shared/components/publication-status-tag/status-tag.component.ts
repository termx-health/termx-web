import {Component, Input} from '@angular/core';

@Component({
  selector: 'tw-status-tag',
  templateUrl: './status-tag.component.html',
  host: {style: 'display: inline-flex'}
})
export class StatusTagComponent {
  @Input() public status?: string;

  public statusMap: {[status: string]: string} = {
    'active': 'success',
    'draft': 'warning',
    'retired': 'error'
  };
}
