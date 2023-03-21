import {NgModule} from '@angular/core';
import {SharedModule} from '../core/shared/shared.module';
import {IntegrationDashboardComponent} from './dashboard/integration-dashboard.component';
import {IntegrationFhirSyncComponent} from './fhir/integration-fhir-sync.component';
import {Routes} from '@angular/router';
import {FhirCodeSystemLookupComponent} from './fhir/code-system/fhir-code-system-lookup.component';
import {FhirCodeSystemValidateCodeComponent} from './fhir/code-system/fhir-code-system-validate-code.component';
import {FhirConceptMapTranslateComponent} from './fhir/concept-map/fhir-concept-map-translate.component';
import {IntegrationAtcImportComponent} from './import/atc/integration-atc-import.component';
import {IntegrationIcdImportComponent} from './import/icd-10/integration-icd-import.component';
import {FhirCodeSystemSubsumesComponent} from './fhir/code-system/fhir-code-system-subsumes.component';
import {FhirConceptMapClosureComponent} from './fhir/concept-map/fhir-concept-map-closure.component';
import {FhirValueSetExpandComponent} from './fhir/value-set/fhir-value-set-expand.component';
import {FhirValueSetValidateCodeComponent} from './fhir/value-set/fhir-value-set-validate-code.component';
import {FhirCodeSystemFindMatchesComponent} from './fhir/code-system/fhir-code-system-find-matches.component';
import {CodeSystemFileImportComponent} from './file-import/code-system/code-system-file-import.component';
import {ConceptMapFileImportComponent} from './file-import/concept-map/concept-map-file-import.component';
import {SnomedDashboardComponent} from './snomed/snomed-dashboard.component';
import {SnomedConceptInfoComponent} from './snomed/snomed-concept-info.component';
import {OrphanetImportComponent} from './import/orphanet/orphanet-import-component';
import {GithubExportComponent} from './github/github-export.component';
import {IntegrationIchiImportComponent} from './import/ichi/integration-ichi-import.component';
import {FhirLibModule} from 'term-web/fhir/_lib';
import {JobLibModule} from 'term-web/job/_lib';
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {ResourcesLibModule} from 'term-web/resources/_lib';

export const INTEGRATION_ROUTES: Routes = [
  {
    path: '', component: IntegrationDashboardComponent, children: [
      {path: 'fhir/$sync', component: IntegrationFhirSyncComponent, data: {privilege: ['*.CodeSystem.edit', '*.ValueSet.edit', '*.MapSet.edit']}},
      {path: 'fhir/CodeSystem/$lookup', component: FhirCodeSystemLookupComponent, data: {privilege: ['*.CodeSystem.view']}},
      {path: 'fhir/CodeSystem/$validate-code', component: FhirCodeSystemValidateCodeComponent, data: {privilege: ['*.CodeSystem.view']}},
      {path: 'fhir/CodeSystem/$subsumes', component: FhirCodeSystemSubsumesComponent, data: {privilege: ['*.CodeSystem.view']}},
      {path: 'fhir/CodeSystem/$find-matches', component: FhirCodeSystemFindMatchesComponent, data: {privilege: ['*.CodeSystem.view']}},
      {path: 'fhir/ValueSet/$expand', component: FhirValueSetExpandComponent, data: {privilege: ['*.ValueSet.view']}},
      {path: 'fhir/ValueSet/$validate-code', component: FhirValueSetValidateCodeComponent, data: {privilege: ['*.ValueSet.view']}},
      {path: 'fhir/ConceptMap/$translate', component: FhirConceptMapTranslateComponent, data: {privilege: ['*.MapSet.view']}},
      {path: 'fhir/ConceptMap/$closure', component: FhirConceptMapClosureComponent, data: {privilege: ['*.MapSet.edit']}},
      {path: 'atc/import', component: IntegrationAtcImportComponent, data: {privilege: ['*.CodeSystem.edit']}},
      {path: 'icd-10/import', component: IntegrationIcdImportComponent, data: {privilege: ['*.CodeSystem.edit']}},
      {path: 'ichi/import', component: IntegrationIchiImportComponent, data: {privilege: ['*.CodeSystem.edit']}},
      {path: 'orphanet/import', component: OrphanetImportComponent, data: {privilege: ['*.CodeSystem.edit']}},
      {path: 'file-import/code-system', component: CodeSystemFileImportComponent, data: {privilege: ['*.CodeSystem.edit']}},
      {path: 'file-import/concept-map', component: ConceptMapFileImportComponent, data: {privilege: ['*.MapSet.edit']}}
    ]
  },
  {path: 'snomed', component: SnomedDashboardComponent, data: {privilege: ['*.Snomed.view']}},
  {path: 'snomed/:conceptId', component: SnomedDashboardComponent, data: {privilege: ['*.Snomed.view']}}
];

@NgModule({
  imports: [
    SharedModule,
    FhirLibModule,
    JobLibModule,
    IntegrationLibModule,
    ResourcesLibModule
  ],
  exports: [
    GithubExportComponent
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
    IntegrationIchiImportComponent,
    CodeSystemFileImportComponent,
    ConceptMapFileImportComponent,
    OrphanetImportComponent,
    SnomedDashboardComponent,
    SnomedConceptInfoComponent,
    GithubExportComponent
  ]
})
export class IntegrationModule {
}
