import {NgModule} from '@angular/core';
import {MeasurementUnitLibService} from './services/measurement-unit-lib.service';
import {MeasurementUnitSearchComponent} from './containers/measurement-unit-search.component';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule,
    MarinaUtilModule,
    CoreUtilModule,
    CommonModule,
  ],
  declarations: [
    MeasurementUnitSearchComponent
  ],
  exports: [
    MeasurementUnitSearchComponent
  ],
  providers: [
    MeasurementUnitLibService
  ]

})
export class MeasurementUnitLibModule {
}
