import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {CodeSystemChecklistConfigurationComponent} from 'term-web/resources/code-system/containers/checklist/code-system-checklist-configuration.component';
import {CodeSystemChecklistValidationComponent} from 'term-web/resources/code-system/containers/checklist/code-system-checklist-validation.component';
import {CodeSystemChecklistComponent} from 'term-web/resources/code-system/containers/checklist/code-system-checklist.component';
import {CodeSystemConceptsPropertyViewComponent} from 'term-web/resources/code-system/containers/concepts/code-system-concepts-property-view.component';
import {CodeSystemConceptsComponent} from 'term-web/resources/code-system/containers/concepts/code-system-concepts.component';
import {CodeSystemConceptReferenceComponent} from 'term-web/resources/code-system/containers/concepts/edit/reference/code-system-concept-reference.component';
import {
  CodeSystemConceptsListConceptPreviewComponent
} from 'term-web/resources/code-system/containers/concepts/list/code-system-concepts-list-concept-preview.component';
import {CodeSystemSupplementModalComponent} from 'term-web/resources/code-system/containers/edit/code-system-supplement-modal.component';
import {CodeSystemValueSetAddComponent} from 'term-web/resources/code-system/containers/edit/valueset/code-system-value-set-add.component';
import {CodeSystemProvenancesComponent} from 'term-web/resources/code-system/containers/provenance/code-system-provenances.component';
import {CodeSystemSummaryComponent} from 'term-web/resources/code-system/containers/summary/code-system-summary.component';
import {CodeSystemInfoWidgetComponent} from 'term-web/resources/code-system/containers/summary/widgets/code-system-info-widget.component';
import {CodeSystemUnlinkedConceptsComponent} from 'term-web/resources/code-system/containers/summary/widgets/code-system-unlinked-concepts.component';
import {CodeSystemVersionsWidgetComponent} from 'term-web/resources/code-system/containers/summary/widgets/code-system-versions-widget.component';
import {CodeSystemCompareComponent} from 'term-web/resources/code-system/containers/version/compare/code-system-compare.component';
import {CodeSystemVersionConceptsComponent} from 'term-web/resources/code-system/containers/version/concepts/code-system-version-concepts.component';
import {CodeSystemVersionSummaryComponent} from 'term-web/resources/code-system/containers/version/summary/code-system-version-summary.component';
import {
  CodeSystemVersionInfoWidgetComponent
} from 'term-web/resources/code-system/containers/version/summary/widgets/code-system-version-info-widget.component';
import {CodeSystemValidatorComponent} from 'term-web/resources/code-system/containers/version/validator/code-system-validator.component';
import {ResourceModule} from 'term-web/resources/resource/resource.module';
import {ValueSetModule} from 'term-web/resources/value-set/value-set.module';
import {SequenceLibModule} from 'term-web/sequence/_lib/sequence-lib.module';
import {SysLibModule} from 'term-web/sys/_lib';
import {UserLibModule} from 'term-web/user/_lib';
import {FinderModule} from '../../core/components/finder/finder.module';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {FinderCodeSystemListComponent} from './containers-finder/code-system-list.component';
import {FinderCodeSystemViewComponent} from './containers-finder/code-system-view.component';
import {FinderCodeSystemConceptVersionViewComponent} from './containers-finder/concept/code-system-concept-version-view.component';
import {FinderCodeSystemConceptViewComponent} from './containers-finder/concept/code-system-concept-view.component';
import {FinderCodeSystemVersionViewComponent} from './containers-finder/version/code-system-version-view.component';
import {CodeSystemAssociationEditComponent} from './containers/concepts/edit/association/code-system-association-edit.component';
import {CodeSystemConceptEditComponent} from './containers/concepts/edit/code-system-concept-edit.component';
import {CodeSystemConceptViewComponent} from './containers/concepts/edit/code-system-concept-view.component';
import {CodeSystemDesignationEditComponent} from './containers/concepts/edit/designation/code-system-designation-edit.component';
import {CodeSystemPropertyValueEditComponent} from './containers/concepts/edit/propertyvalue/code-system-property-value-edit.component';
import {CodeSystemConceptsListComponent} from './containers/concepts/list/code-system-concepts-list.component';
import {CodeSystemDuplicateModalComponent} from './containers/edit/code-system-duplicate-modal.component';
import {CodeSystemEditComponent} from './containers/edit/code-system-edit.component';
import {CodeSystemPropertiesComponent} from './containers/edit/property/code-system-properties.component';
import {CodeSystemListComponent} from './containers/list/code-system-list.component';
import {CodeSystemVersionDuplicateModalComponent} from './containers/version/edit/code-system-version-duplicate-modal.component';
import {CodeSystemVersionEditComponent} from './containers/version/edit/code-system-version-edit.component';
import {CodeSystemService} from './services/code-system.service';

const EDIT = {privilege: ['{id}.CodeSystem.edit']};
const VIEW = {privilege: ['{id}.CodeSystem.view']};
export const CODE_SYSTEM_ROUTES: Routes = [
  {path: '', component: CodeSystemListComponent},
  {path: 'add', component: CodeSystemEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/edit', component: CodeSystemEditComponent, data: EDIT},
  {path: ':id/summary', component: CodeSystemSummaryComponent, data: VIEW},
  {path: ':id/concepts', component: CodeSystemConceptsComponent, data: VIEW},
  {path: ':id/properties', component: CodeSystemConceptsPropertyViewComponent, data: VIEW},
  {path: ':id/provenances', component: CodeSystemProvenancesComponent, data: VIEW},
  {path: ':id/checklists', component: CodeSystemChecklistComponent, data: VIEW},
  {path: ':id/concepts/add', component: CodeSystemConceptEditComponent, data: EDIT},
  {path: ':id/concepts/:conceptCode/edit', component: CodeSystemConceptEditComponent, data: EDIT},
  {path: ':id/concepts/:conceptCode/view', component: CodeSystemConceptViewComponent, data: VIEW},
  {path: ':id/versions/add', component: CodeSystemVersionEditComponent, data: EDIT},
  {path: ':id/versions/:versionCode/summary', component: CodeSystemVersionSummaryComponent, data: VIEW},
  {path: ':id/versions/:versionCode/concepts', component: CodeSystemVersionConceptsComponent, data: VIEW},
  {path: ':id/versions/:versionCode/properties', component: CodeSystemConceptsPropertyViewComponent, data: VIEW},
  {path: ':id/versions/:versionCode/provenances', component: CodeSystemProvenancesComponent, data: VIEW},
  {path: ':id/versions/:versionCode/checklists', component: CodeSystemChecklistComponent, data: VIEW},
  {path: ':id/versions/:versionCode/edit', component: CodeSystemVersionEditComponent, data: EDIT},
  {path: ':id/versions/:versionCode/concepts/add', component: CodeSystemConceptEditComponent, data: EDIT},
  {path: ':id/versions/:versionCode/concepts/:conceptCode/edit', component: CodeSystemConceptEditComponent, data: EDIT},
  {path: ':id/versions/:versionCode/concepts/:conceptCode/view', component: CodeSystemConceptViewComponent, data: VIEW},
  {path: 'compare', component: CodeSystemCompareComponent, data: {privilege: ['*.CodeSystem.view']}},
  {path: 'validator', component: CodeSystemValidatorComponent, data: {privilege: ['*.CodeSystem.view']}},
];

export const CODE_SYSTEM_FINDER_ROUTES: Routes = [{
  path: '', component: FinderCodeSystemListComponent, children: [{
    path: ':id', component: FinderCodeSystemViewComponent, data: VIEW, children: [{
      path: 'versions/:versionCode', component: FinderCodeSystemVersionViewComponent
    }, {
      path: 'concepts/:conceptCode', component: FinderCodeSystemConceptViewComponent, children: [{
        path: 'versions/:versionId', component: FinderCodeSystemConceptVersionViewComponent
      }]
    }]
  }]
}];

@NgModule({
  imports: [
    CoreUiModule,
    FinderModule,
    ResourcesLibModule,
    MarinaQuillModule,
    SequenceLibModule,
    ResourceModule,
    UserLibModule,
    SysLibModule,
    ValueSetModule,
  ],
  declarations: [
    CodeSystemListComponent,
    CodeSystemEditComponent,
    CodeSystemDuplicateModalComponent,
    CodeSystemSupplementModalComponent,

    CodeSystemVersionEditComponent,
    CodeSystemVersionDuplicateModalComponent,

    CodeSystemConceptsListComponent,
    CodeSystemConceptsPropertyViewComponent,
    CodeSystemConceptsListConceptPreviewComponent,
    CodeSystemConceptViewComponent,
    CodeSystemConceptEditComponent,
    CodeSystemDesignationEditComponent,
    CodeSystemPropertyValueEditComponent,
    CodeSystemAssociationEditComponent,
    CodeSystemConceptReferenceComponent,
    CodeSystemCompareComponent,
    CodeSystemValidatorComponent,
    CodeSystemPropertiesComponent,

    FinderCodeSystemListComponent,
    FinderCodeSystemViewComponent,
    FinderCodeSystemVersionViewComponent,
    FinderCodeSystemConceptViewComponent,
    FinderCodeSystemConceptVersionViewComponent,

    CodeSystemSummaryComponent,
    CodeSystemInfoWidgetComponent,
    CodeSystemVersionsWidgetComponent,
    CodeSystemValueSetAddComponent,
    CodeSystemConceptsComponent,
    CodeSystemProvenancesComponent,
    CodeSystemChecklistComponent,
    CodeSystemChecklistConfigurationComponent,
    CodeSystemChecklistValidationComponent,
    CodeSystemUnlinkedConceptsComponent,

    CodeSystemVersionSummaryComponent,
    CodeSystemVersionInfoWidgetComponent,
    CodeSystemVersionConceptsComponent
  ],
  exports: [
    CodeSystemListComponent,
    CodeSystemConceptsListComponent,
    CodeSystemPropertiesComponent,
  ],
  providers: [
    CodeSystemService
  ]
})
export class CodeSystemModule {
}
