import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {MeasurementUnitLibModule} from 'term-web/measurement-unit/_lib';
import {CoreUiModule} from '../core/ui/core-ui.module';
import {MeasurementUnitEditComponent} from './containers/edit/measurement-unit-edit.component';
import {MeasurementUnitViewComponent} from './containers/edit/measurement-unit-view.component';
import {MeasurementUnitMappingListComponent} from './containers/mapping/measurement-unit-mapping-list.component';
import {MeasurementUnitListComponent} from './containers/measurement-unit-list.component';
import {MeasurementUnitService} from './services/measurement-unit.service';


export const MEASUREMENT_UNIT_ROUTES: Routes = [
  {path: '', component: MeasurementUnitListComponent},
  {path: 'add', data: {privilege: ['ucum.CodeSystem.edit']}, component: MeasurementUnitEditComponent},
  {path: ':id/edit', data: {privilege: ['ucum.CodeSystem.edit']}, component: MeasurementUnitEditComponent},
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
    CoreUiModule,
    MeasurementUnitLibModule
  ],
  providers: [
    MeasurementUnitService
  ]
})
export class MeasurementUnitModule {
}
