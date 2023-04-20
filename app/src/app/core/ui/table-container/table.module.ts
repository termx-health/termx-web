import {NgModule} from '@angular/core';
import {SharedModule} from 'term-web/core/shared/shared.module';
import {TableComponent} from './table.component';
import {TableFilterComponent} from './table-filter.component';

@NgModule({
  imports: [
    SharedModule
  ],
  exports: [
    TableComponent,
    TableFilterComponent
  ],
  declarations: [
    TableComponent,
    TableFilterComponent
  ]
})
export class TableModule {
}
