import {NgModule} from '@angular/core';
import {ResourcesLibModule} from './resources';
import {FhirLibModule} from './fhir';
import {JobLibModule} from './job';

@NgModule({
  imports: [
    FhirLibModule,
    ResourcesLibModule,
    JobLibModule
  ],
  exports: [
    FhirLibModule,
    ResourcesLibModule,
    JobLibModule
  ]
})
export class TerminologyLibModule {
}


