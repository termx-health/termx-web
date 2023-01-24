import {NgModule} from '@angular/core';
import {MeasurementUnitLibService} from './services/measurement-unit-lib.service';
import {MeasurementUnitSearchComponent} from './containers/measurement-unit-search.component';
import {SharedModule} from '../../../app/src/app/core/shared/shared.module';

@NgModule({
  providers: [
    MeasurementUnitLibService
  ],
  declarations: [
    MeasurementUnitSearchComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    MeasurementUnitSearchComponent
  ]

})
export class MeasurementUnitLibModule {
}
