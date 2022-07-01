import {NgModule} from '@angular/core';
import {ResourcesLibModule} from './resources';
import {FhirLibModule} from './fhir';
import {JobLibModule} from './job';
import {IntegrationLibModule} from './integration';
import {PrivilegeLibModule} from './privileges';

@NgModule({
  imports: [
    FhirLibModule,
    IntegrationLibModule,
    ResourcesLibModule,
    JobLibModule,
    PrivilegeLibModule
  ],
  exports: [
    FhirLibModule,
    IntegrationLibModule,
    ResourcesLibModule,
    JobLibModule,
    PrivilegeLibModule
  ]
})
export class TerminologyLibModule {
}


