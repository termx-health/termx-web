import {NgModule} from '@angular/core';
import {CoreUiModule} from '../core/ui/core-ui.module';
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
import {CodeSystemFileImportFormComponent} from './import/file-import/code-system/code-system-file-import-form.component';
import {ConceptMapFileImportComponent} from './import/file-import/concept-map/concept-map-file-import.component';
import {SnomedDashboardComponent} from './snomed/containers/snomed-dashboard.component';
import {SnomedConceptInfoComponent} from './snomed/containers/snomed-concept-info.component';
import {IntegrationIchiImportComponent} from './import/ichi/integration-ichi-import.component';
import {FhirLibModule} from 'term-web/fhir/_lib';
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {LoincImportComponent} from 'term-web/integration/import/loinc/loinc-import.component';
import {LoincDashboardComponent} from 'term-web/integration/loinc/loinc-dashboard.component';
import {LoincPartListComponent} from 'term-web/integration/loinc/loinc-part-list.component';
import {LoincListComponent} from 'term-web/integration/loinc/loinc-list.component';
import {LoincAnswerListListComponent} from 'term-web/integration/loinc/loinc-answer-list-list.component';
import {LoincPartSearchComponent} from 'term-web/integration/loinc/loinc-part-search.component';
import {SnomedTranslationListComponent} from 'term-web/integration/snomed/containers/snomed-translation-list.component';
import {SnomedTranslationService} from 'term-web/integration/snomed/services/snomed-translation.service';
import {ImportJobLogComponent} from 'term-web/integration/import-job-log.component';
import {FileAnalysisService} from 'term-web/integration/import/file-import/file-analysis.service';
import {AssociationFileImportComponent} from 'term-web/integration/import/file-import/association/association-file-import.component';
import {SnomedManagementComponent} from 'term-web/integration/snomed/containers/management/snomed-management.component';
import {SnomedBranchEditComponent} from 'term-web/integration/snomed/containers/management/branch/snomed-branch-edit.component';
import {SnomedBranchManagementComponent} from 'term-web/integration/snomed/containers/management/branch/snomed-branch-management.component';
import {SnomedService} from 'term-web/integration/snomed/services/snomed-service';
import {CodeSystemFileImportComponent} from 'term-web/integration/import/file-import/code-system/csv/code-system-file-import.component';
import {OrphanetImportComponent} from 'term-web/integration/import/file-import/code-system/orphanet/orphanet-import.component';
import {MapSetModule} from 'term-web/resources/map-set/map-set.module';
import {ValueSetFileImportComponent} from 'term-web/integration/import/file-import/value-set/value-set-file-import.component';
import {SnomedCodesystemEditComponent} from 'term-web/integration/snomed/containers/management/codesystem/snomed-codesystem-edit.component';
import {SysLibModule} from 'term-web/sys/_lib';
import {ResourceModule} from 'term-web/resources/resource/resource.module';
import {UserLibModule} from 'term-web/user/_lib';
import {NzProgressModule} from 'ng-zorro-antd/progress';

export const INTEGRATION_ROUTES: Routes = [
  {
    path: 'dashboard', component: IntegrationDashboardComponent, children: [
      {path: 'fhir/$sync', component: IntegrationFhirSyncComponent, data: {privilege: ['*.CodeSystem.edit', '*.ValueSet.edit', '*.MapSet.edit']}},
      {path: 'fhir/CodeSystem/$lookup', component: FhirCodeSystemLookupComponent, data: {privilege: ['*.CodeSystem.view']}},
      {path: 'fhir/CodeSystem/$validate-code', component: FhirCodeSystemValidateCodeComponent, data: {privilege: ['*.CodeSystem.view']}},
      {path: 'fhir/CodeSystem/$subsumes', component: FhirCodeSystemSubsumesComponent, data: {privilege: ['*.CodeSystem.view']}},
      {path: 'fhir/CodeSystem/$find-matches', component: FhirCodeSystemFindMatchesComponent, data: {privilege: ['*.CodeSystem.view']}},
      {path: 'fhir/ValueSet/$expand', component: FhirValueSetExpandComponent, data: {privilege: ['*.ValueSet.view']}},
      {path: 'fhir/ValueSet/$validate-code', component: FhirValueSetValidateCodeComponent, data: {privilege: ['*.ValueSet.view']}},
      {path: 'fhir/ConceptMap/$translate', component: FhirConceptMapTranslateComponent, data: {privilege: ['*.MapSet.view']}},
      {path: 'fhir/ConceptMap/$closure', component: FhirConceptMapClosureComponent, data: {privilege: ['*.MapSet.view']}},
      {path: 'atc/import', component: IntegrationAtcImportComponent, data: {privilege: ['*.CodeSystem.edit']}},
      {path: 'icd-10/import', component: IntegrationIcdImportComponent, data: {privilege: ['*.CodeSystem.edit']}},
      {path: 'ichi/import', component: IntegrationIchiImportComponent, data: {privilege: ['*.CodeSystem.edit']}},
      {path: 'orphanet/import', component: OrphanetImportComponent, data: {privilege: ['*.CodeSystem.edit']}},
      {path: 'loinc/import', component: LoincImportComponent, data: {privilege: ['*.CodeSystem.edit']}},
      {path: 'file-import/code-system', component: CodeSystemFileImportComponent, data: {privilege: ['*.CodeSystem.edit']}},
      {path: 'file-import/value-set', component: ValueSetFileImportComponent, data: {privilege: ['*.CodeSystem.edit']}},
      {path: 'file-import/concept-map', component: ConceptMapFileImportComponent, data: {privilege: ['*.MapSet.edit']}},
      {path: 'file-import/association', component: AssociationFileImportComponent, data: {privilege: ['*.MapSet.edit']}}
    ]
  },
  {path: 'loinc', component: LoincDashboardComponent, data: {privilege: ['loinc.CodeSystem.view']}},
  {path: 'snomed/management', component: SnomedManagementComponent, data: {privilege: ['snomed-ct.CodeSystem.view']}},
  {path: 'snomed/branches/add', component: SnomedBranchEditComponent, data: {privilege: ['snomed-ct.CodeSystem.edit']}},
  {path: 'snomed/branches/:path/edit', component: SnomedBranchEditComponent, data: {privilege: ['snomed-ct.CodeSystem.edit']}},
  {path: 'snomed/branches/:path/management', component: SnomedBranchManagementComponent, data: {privilege: ['snomed-ct.CodeSystem.edit']}},
  {path: 'snomed/codesystems/:shortName/edit', component: SnomedCodesystemEditComponent, data: {privilege: ['snomed-ct.CodeSystem.edit']}},
  {path: 'snomed/dashboard', component: SnomedDashboardComponent, data: {privilege: ['snomed-ct.CodeSystem.view']}},
  {path: 'snomed/dashboard/:conceptId', component: SnomedDashboardComponent, data: {privilege: ['snomed-ct.CodeSystem.view']}}
];

@NgModule({
  imports: [
    CoreUiModule,
    ResourcesLibModule,
    FhirLibModule,
    IntegrationLibModule,
    MapSetModule,
    SysLibModule,
    ResourceModule,
    UserLibModule,
    NzProgressModule
  ],
  exports: [
    LoincListComponent,
    LoincPartListComponent,
    LoincAnswerListListComponent,
    SnomedTranslationListComponent,
  ],
  declarations: [
    ImportJobLogComponent,

    IntegrationDashboardComponent,
    IntegrationFhirSyncComponent,
    IntegrationAtcImportComponent,
    IntegrationIcdImportComponent,
    IntegrationIchiImportComponent,

    FhirCodeSystemLookupComponent,
    FhirCodeSystemSubsumesComponent,
    FhirCodeSystemFindMatchesComponent,
    FhirCodeSystemValidateCodeComponent,
    FhirValueSetExpandComponent,
    FhirValueSetValidateCodeComponent,
    FhirConceptMapTranslateComponent,
    FhirConceptMapClosureComponent,

    SnomedDashboardComponent,
    SnomedConceptInfoComponent,
    SnomedTranslationListComponent,
    SnomedManagementComponent,
    SnomedBranchEditComponent,
    SnomedBranchManagementComponent,
    SnomedCodesystemEditComponent,

    LoincDashboardComponent,
    LoincListComponent,
    LoincPartListComponent,
    LoincAnswerListListComponent,
    LoincPartSearchComponent,
    LoincImportComponent,

    CodeSystemFileImportFormComponent,
    CodeSystemFileImportComponent,
    OrphanetImportComponent,
    ConceptMapFileImportComponent,
    ValueSetFileImportComponent,
    AssociationFileImportComponent
  ],
  providers: [
    SnomedService,
    SnomedTranslationService,
    FileAnalysisService
  ]
})
export class IntegrationModule {
}
