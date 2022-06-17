import {NgModule} from '@angular/core';
import {ResourcesLibModule} from './resources';
import {FhirLibModule} from './fhir';
import {JobLibModule} from './job';
import {IntegrationLibModule} from './integration/integration-lib.module';

@NgModule({
  imports: [
    FhirLibModule,
    IntegrationLibModule,
    ResourcesLibModule,
    JobLibModule
  ],
  exports: [
    FhirLibModule,
    IntegrationLibModule,
    ResourcesLibModule,
    JobLibModule
  ]
})
export class TerminologyLibModule {
}


