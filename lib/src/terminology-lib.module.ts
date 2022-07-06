import {NgModule} from '@angular/core';
import {ResourcesLibModule} from './resources';
import {FhirLibModule} from './fhir';
import {JobLibModule} from './job';
import {IntegrationLibModule} from './integration';
import {AuthLibModule} from './auth/auth-lib.module';

@NgModule({
  imports: [
    FhirLibModule,
    IntegrationLibModule,
    ResourcesLibModule,
    JobLibModule,
    AuthLibModule
  ],
  exports: [
    FhirLibModule,
    IntegrationLibModule,
    ResourcesLibModule,
    JobLibModule,
    AuthLibModule
  ]
})
export class TerminologyLibModule {
}


