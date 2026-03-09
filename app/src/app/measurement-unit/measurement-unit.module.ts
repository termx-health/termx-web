import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {MeasurementUnitLibModule} from 'term-web/measurement-unit/_lib';
import {CoreUiModule} from 'term-web/core/ui/core-ui.module';
import {MeasurementUnitEditComponent} from 'term-web/measurement-unit/containers/edit/measurement-unit-edit.component';
import {MeasurementUnitViewComponent} from 'term-web/measurement-unit/containers/edit/measurement-unit-view.component';
import {MeasurementUnitMappingListComponent} from 'term-web/measurement-unit/containers/mapping/measurement-unit-mapping-list.component';
import {MeasurementUnitListComponent} from 'term-web/measurement-unit/containers/measurement-unit-list.component';
import {MeasurementUnitService} from 'term-web/measurement-unit/services/measurement-unit.service';


export const MEASUREMENT_UNIT_ROUTES: Routes = [
  {path: '', component: MeasurementUnitListComponent},
  {path: 'add', data: {privilege: ['ucum.CodeSystem.edit']}, component: MeasurementUnitEditComponent},
  {path: ':id/edit', data: {privilege: ['ucum.CodeSystem.edit']}, component: MeasurementUnitEditComponent},
  {path: ':id/view', component: MeasurementUnitViewComponent},
];

@NgModule({
    imports: [
        CoreUiModule,
        MeasurementUnitLibModule,
        MeasurementUnitListComponent,
        MeasurementUnitEditComponent,
        MeasurementUnitViewComponent,
        MeasurementUnitMappingListComponent
    ],
    providers: [
        MeasurementUnitService
    ]
})
export class MeasurementUnitModule {
}
