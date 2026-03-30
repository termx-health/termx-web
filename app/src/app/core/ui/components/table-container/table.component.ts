import {Component, ContentChild, EventEmitter, Input, Output} from '@angular/core';
import {TableFilterComponent} from 'term-web/core/ui/components/table-container/table-filter.component';
import { MuiCardModule, MuiButtonModule, MuiIconModule } from '@termx-health/ui';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-table',
    templateUrl: 'table.component.html',
    styleUrls: ['table.component.less'],
    imports: [MuiCardModule, MuiButtonModule, MuiIconModule, TranslatePipe]
})
export class TableComponent {
  @Input() public filterOpen: boolean;
  @Input() public filterTitle?: string;
  @Output() public filterOpenChange = new EventEmitter<boolean>();

  @ContentChild(TableFilterComponent) protected filter: TableFilterComponent;
  protected isFilterFullyOpened: boolean;

  protected reset(): void {
    this.filter.reset();
  }

  protected closeFilter(): void {
    this.filterOpen = this.isFilterFullyOpened = false;
    this.filterOpenChange.emit(false);
  }

  protected onFilterTransitionEnd(te: TransitionEvent): void {
    if (te.propertyName === 'max-width') {
      this.isFilterFullyOpened = true;
    }
  }
}
