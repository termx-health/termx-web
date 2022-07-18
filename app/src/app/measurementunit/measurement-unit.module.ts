import {NgModule} from '@angular/core';
import {MeasurementUnitLibModule} from 'terminology-lib/measurementunit';
import {SharedModule} from '../core/shared/shared.module';
import {MeasurementUnitService} from './services/measurement-unit.service';
import {MeasurementUnitListComponent} from './containers/measurement-unit-list.component';
import {Routes} from '@angular/router';


export const MEASUREMENT_UNIT_ROUTES: Routes = [
  {path: '', component: MeasurementUnitListComponent},
];

@NgModule({
  declarations: [
    MeasurementUnitListComponent
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
