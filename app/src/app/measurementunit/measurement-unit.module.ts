import {NgModule} from '@angular/core';
import {MeasurementUnitLibModule} from 'terminology-lib/measurementunit';
import {SharedModule} from '../core/shared/shared.module';
import {MeasurementUnitService} from './services/measurement-unit.service';
import {MeasurementUnitListComponent} from './containers/measurement-unit-list.component';
import {Routes} from '@angular/router';
import {MeasurementUnitEditComponent} from './containers/edit/measurement-unit-edit.component';
import {MeasurementUnitViewComponent} from './containers/edit/measurement-unit-view.component';
import {MeasurementUnitMappingListComponent} from './containers/mapping/measurement-unit-mapping-list.component';


export const MEASUREMENT_UNIT_ROUTES: Routes = [
  {path: '', component: MeasurementUnitListComponent},
  {path: 'add', data: {privilege: ['*.edit']}, component: MeasurementUnitEditComponent},
  {path: ':id/edit', data: {privilege: ['*.edit']}, component: MeasurementUnitEditComponent},
  {path: ':id/view', component: MeasurementUnitViewComponent},
];

@NgModule({
  declarations: [
    MeasurementUnitListComponent,
    MeasurementUnitEditComponent,
    MeasurementUnitViewComponent,
    MeasurementUnitMappingListComponent,
  ],
  imports: [
    SharedModule,
    MeasurementUnitLibModule
  ],
  providers: [
    MeasurementUnitService
  ]
})
export class MeasurementUnitModule {
}
