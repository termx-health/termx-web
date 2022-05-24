import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IntegrationLibService} from './services/integration-lib-service';
import {IntegrationFhirLibService} from './services/integration-fhir-lib-service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    IntegrationLibService,
    IntegrationFhirLibService
  ]
})
export class IntegrationLibModule {
}
