import {Component, Input} from '@angular/core';

@Component({
  selector: 'twa-status-tag',
  templateUrl: './status-tag.component.html',
})
export class StatusTagComponent {
  @Input() public status?: string;

  public convertStatus(): string {
    if (this.status === 'active'){
      return 'success';
    }
    if (this.status === 'draft'){
      return 'warning';
    }
    return 'error';
  }

}
