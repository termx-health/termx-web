import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {IntegrationDashboardComponent} from './menu/integration-dashboard.component';
import {IntegrationFhirSyncComponent} from './fhir/integration-fhir-sync.component';
import {IntegrationLibModule} from 'terminology-lib/integration/integration-lib.module';
import {IntegrationFhirService} from './services/integration-fhir-service';
import {IntegrationService} from './services/integration-service';
import {JobLibService} from 'terminology-lib/job/services/job-lib-service';
import {Routes} from '@angular/router';

export const INTEGRATION_ROUTES: Routes = [
  {
    path: '', component: IntegrationDashboardComponent, children: [
      {path: 'fhir/$sync', component: IntegrationFhirSyncComponent}
    ]
  }
];

@NgModule({
  imports: [
    SharedModule,
    IntegrationLibModule
  ],
  declarations: [
    IntegrationDashboardComponent,
    IntegrationFhirSyncComponent
  ],
  providers: [
    IntegrationFhirService,
    IntegrationService,
    JobLibService
  ]
})
export class IntegrationModule {
}