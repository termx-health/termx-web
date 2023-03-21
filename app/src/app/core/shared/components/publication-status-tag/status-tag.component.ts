import {Component, Input} from '@angular/core';

@Component({
  selector: 'tw-status-tag',
  templateUrl: './status-tag.component.html',
})
export class StatusTagComponent {
  @Input() public status?: string;

  public statusMap: {[status: string]: string} = {
    'active': 'success',
    'draft': 'warning',
    'retired': 'error'
  };
}
