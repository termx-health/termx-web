import {NgModule} from '@angular/core';
import {SharedModule} from '../core/shared/shared.module';
import {IntegrationDashboardComponent} from './dashboard/integration-dashboard.component';
import {IntegrationFhirSyncComponent} from './fhir/integration-fhir-sync.component';
import {FhirLibModule} from 'terminology-lib/fhir/fhir-lib.module';
import {Routes} from '@angular/router';
import {JobLibModule} from 'terminology-lib/job/job-lib.module';
import {FhirCodeSystemLookupComponent} from './fhir/code-system/fhir-code-system-lookup.component';
import {ClipboardModule} from 'ngx-clipboard';

export const INTEGRATION_ROUTES: Routes = [
  {
    path: '', component: IntegrationDashboardComponent, children: [
      {path: 'fhir/$sync', component: IntegrationFhirSyncComponent},
      {path: 'fhir/CodeSystem/$lookup', component: FhirCodeSystemLookupComponent}
    ]
  }
];

@NgModule({
  imports: [
    SharedModule,
    FhirLibModule,
    JobLibModule,
    ClipboardModule
  ],
  declarations: [
    IntegrationDashboardComponent,
    IntegrationFhirSyncComponent,
    FhirCodeSystemLookupComponent
  ],
})
export class IntegrationModule {
}
