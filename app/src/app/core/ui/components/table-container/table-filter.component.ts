import {Component, EventEmitter, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MuiButtonModule } from '@termx-health/ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-table-filter',
    templateUrl: 'table-filter.component.html',
    imports: [FormsModule, MuiButtonModule, TranslatePipe]
})
export class TableFilterComponent {
  @Output() public twSearch = new EventEmitter<void>();
  @Output() public twReset = new EventEmitter<void>();

  public search(): void {
    this.twSearch.emit();
  }

  public reset(): void {
    this.twReset.emit();
  }
}
