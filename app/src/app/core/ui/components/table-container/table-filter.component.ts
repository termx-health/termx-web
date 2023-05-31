import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'tw-table-filter',
  templateUrl: 'table-filter.component.html'
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
