import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {IntegrationMenuComponent} from './menu/integration-menu.component';
import {IntegrationSyncComponent} from './cards/integration-sync.component';
import {IntegrationLibModule} from 'terminology-lib/integration/integration-lib.module';
import {IntegrationFhirService} from './services/integration-fhir-service';
import {IntegrationService} from './services/integration-service';
import {JobLibService} from 'terminology-lib/job/services/job-lib-service';

@NgModule({
  imports: [
    SharedModule,
    IntegrationLibModule
  ],
  declarations: [
    IntegrationMenuComponent,
    IntegrationSyncComponent
  ],
  providers: [
    IntegrationFhirService,
    IntegrationService,
    JobLibService
  ]
})
export class IntegrationModule {
}