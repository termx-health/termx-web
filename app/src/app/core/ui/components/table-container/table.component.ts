import {Component, ContentChild, EventEmitter, Input, Output} from '@angular/core';
import {TableFilterComponent} from 'term-web/core/ui/components/table-container/table-filter.component';

@Component({
  selector: 'tw-table',
  templateUrl: 'table.component.html',
  styleUrls: ['table.component.less']
})
export class TableComponent {
  @Input() public filterOpen: boolean;
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
