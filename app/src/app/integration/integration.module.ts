import {NgModule} from '@angular/core';
import {SharedModule} from '../core/shared/shared.module';
import {IntegrationDashboardComponent} from './dashboard/integration-dashboard.component';
import {IntegrationFhirSyncComponent} from './fhir/integration-fhir-sync.component';
import {FhirLibModule} from 'terminology-lib/fhir';
import {Routes} from '@angular/router';
import {JobLibModule} from 'terminology-lib/job';
import {FhirCodeSystemLookupComponent} from './fhir/code-system/fhir-code-system-lookup.component';
import {FhirCodeSystemValidateCodeComponent} from './fhir/code-system/fhir-code-system-validate-code.component';
import {FhirConceptMapTranslateComponent} from './fhir/concept-map/fhir-concept-map-translate.component';
import {IntegrationAtcImportComponent} from './import/atc/integration-atc-import.component';
import {IntegrationLibModule} from 'terminology-lib/integration';
import {IntegrationIcdImportComponent} from './import/icd-10/integration-icd-import.component';

export const INTEGRATION_ROUTES: Routes = [
  {
    path: '', component: IntegrationDashboardComponent, children: [
      {path: 'fhir/$sync', component: IntegrationFhirSyncComponent},
      {path: 'fhir/CodeSystem/$lookup', component: FhirCodeSystemLookupComponent},
      {path: 'fhir/CodeSystem/$validate-code', component: FhirCodeSystemValidateCodeComponent},
      {path: 'fhir/ConceptMap/$translate', component: FhirConceptMapTranslateComponent},
      {path: 'atc/$import', component: IntegrationAtcImportComponent},
      {path: 'icd-10/$import', component: IntegrationIcdImportComponent}
    ]
  }
];

@NgModule({
  imports: [
    SharedModule,
    FhirLibModule,
    JobLibModule,
    IntegrationLibModule
  ],
  declarations: [
    IntegrationDashboardComponent,
    IntegrationFhirSyncComponent,
    FhirCodeSystemLookupComponent,
    FhirCodeSystemValidateCodeComponent,
    FhirConceptMapTranslateComponent,
    IntegrationAtcImportComponent,
    IntegrationIcdImportComponent
  ],
})
export class IntegrationModule {
}
