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
import {FileImportComponent} from './file-import/file-import.component';
import {ResourcesLibModule} from 'terminology-lib/resources';
import {FhirCodeSystemSubsumesComponent} from './fhir/code-system/fhir-code-system-subsumes.component';
import {FhirConceptMapClosureComponent} from './fhir/concept-map/fhir-concept-map-closure.component';
import {FhirValueSetExpandComponent} from './fhir/value-set/fhir-value-set-expand.component';
import {FhirValueSetValidateCodeComponent} from './fhir/value-set/fhir-value-set-validate-code.component';
import {FhirCodeSystemFindMatchesComponent} from './fhir/code-system/fhir-code-system-find-matches.component';

export const INTEGRATION_ROUTES: Routes = [
  {
    path: '', component: IntegrationDashboardComponent, children: [
      {path: 'fhir/$sync', component: IntegrationFhirSyncComponent},
      {path: 'fhir/CodeSystem/$lookup', component: FhirCodeSystemLookupComponent},
      {path: 'fhir/CodeSystem/$validate-code', component: FhirCodeSystemValidateCodeComponent},
      {path: 'fhir/CodeSystem/$subsumes', component: FhirCodeSystemSubsumesComponent},
      {path: 'fhir/CodeSystem/$find-matches', component: FhirCodeSystemFindMatchesComponent},
      {path: 'fhir/ValueSet/$expand', component: FhirValueSetExpandComponent},
      {path: 'fhir/ValueSet/$validate-code', component: FhirValueSetValidateCodeComponent},
      {path: 'fhir/ConceptMap/$translate', component: FhirConceptMapTranslateComponent},
      {path: 'fhir/ConceptMap/$closure', component: FhirConceptMapClosureComponent},
      {path: 'atc/$import', component: IntegrationAtcImportComponent},
      {path: 'icd-10/$import', component: IntegrationIcdImportComponent},
      {path: 'file-import', component: FileImportComponent},
    ]
  }
];

@NgModule({
  imports: [
    SharedModule,
    FhirLibModule,
    JobLibModule,
    IntegrationLibModule,
    ResourcesLibModule
  ],
  declarations: [
    IntegrationDashboardComponent,
    IntegrationFhirSyncComponent,
    FhirCodeSystemLookupComponent,
    FhirCodeSystemSubsumesComponent,
    FhirCodeSystemFindMatchesComponent,
    FhirCodeSystemValidateCodeComponent,
    FhirValueSetExpandComponent,
    FhirValueSetValidateCodeComponent,
    FhirConceptMapTranslateComponent,
    FhirConceptMapClosureComponent,
    IntegrationAtcImportComponent,
    IntegrationIcdImportComponent,
    FileImportComponent
  ],
})
export class IntegrationModule {
}
