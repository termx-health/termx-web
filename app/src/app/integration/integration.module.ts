import {NgModule} from '@angular/core';
import {SharedModule} from '../core/shared/shared.module';
import {IntegrationDashboardComponent} from './dashboard/integration-dashboard.component';
import {IntegrationFhirSyncComponent} from './fhir/integration-fhir-sync.component';
import {IntegrationLibModule} from 'terminology-lib/integration/integration-lib.module';
import {IntegrationFhirService} from './services/integration-fhir-service';
import {IntegrationService} from './services/integration-service';
import {Routes} from '@angular/router';
import {JobLibModule} from 'terminology-lib/job/job-lib.module';
import {IntegrationFhirLookupComponent} from './fhir/integration-fhir-lookup.component';
import {ClipboardModule} from 'ngx-clipboard';

export const INTEGRATION_ROUTES: Routes = [
  {
    path: '', component: IntegrationDashboardComponent, children: [
      {path: 'fhir/$sync', component: IntegrationFhirSyncComponent},
      {path: 'fhir/$lookup', component: IntegrationFhirLookupComponent}
    ]
  }
];

@NgModule({
  imports: [
    SharedModule,
    IntegrationLibModule,
    JobLibModule,
    ClipboardModule
  ],
  declarations: [
    IntegrationDashboardComponent,
    IntegrationFhirSyncComponent,
    IntegrationFhirLookupComponent
  ],
  providers: [
    IntegrationFhirService,
    IntegrationService
  ]
})
export class IntegrationModule {
}
