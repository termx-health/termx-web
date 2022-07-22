import {NgModule} from '@angular/core';
import {ResourcesLibModule} from './resources';
import {FhirLibModule} from './fhir';
import {JobLibModule} from './job';
import {IntegrationLibModule} from './integration';
import {AuthLibModule} from './auth/auth-lib.module';
import {MeasurementUnitLibModule} from './measurementunit';

@NgModule({
  imports: [
    FhirLibModule,
    IntegrationLibModule,
    ResourcesLibModule,
    JobLibModule,
    AuthLibModule,
    MeasurementUnitLibModule
  ],
  exports: [
    FhirLibModule,
    IntegrationLibModule,
    ResourcesLibModule,
    JobLibModule,
    AuthLibModule,
    MeasurementUnitLibModule
  ]
})
export class TerminologyLibModule {
}


