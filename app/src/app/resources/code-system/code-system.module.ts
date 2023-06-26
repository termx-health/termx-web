import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CodeSystemListComponent} from './containers/list/code-system-list.component';
import {CodeSystemPropertiesComponent} from './containers/edit/property/code-system-properties.component';
import {CodeSystemEditComponent} from './containers/edit/code-system-edit.component';
import {CodeSystemVersionEditComponent} from './containers/version/edit/code-system-version-edit.component';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {CodeSystemService} from './services/code-system.service';
import {CodeSystemDuplicateModalComponent} from './containers/edit/code-system-duplicate-modal.component';
import {CodeSystemConceptsListComponent} from './containers/concepts/list/code-system-concepts-list.component';
import {CodeSystemVersionDuplicateModalComponent} from './containers/version/edit/code-system-version-duplicate-modal.component';
import {FinderCodeSystemListComponent} from './containers-finder/code-system-list.component';
import {FinderCodeSystemViewComponent} from './containers-finder/code-system-view.component';
import {FinderCodeSystemVersionViewComponent} from './containers-finder/version/code-system-version-view.component';
import {FinderCodeSystemConceptViewComponent} from './containers-finder/concept/code-system-concept-view.component';
import {FinderCodeSystemConceptVersionViewComponent} from './containers-finder/concept/code-system-concept-version-view.component';
import {FinderModule} from '../../core/components/finder/finder.module';
import {CodeSystemConceptEditComponent} from './containers/concepts/edit/code-system-concept-edit.component';
import {CodeSystemDesignationEditComponent} from './containers/concepts/edit/designation/code-system-designation-edit.component';
import {CodeSystemPropertyValueEditComponent} from './containers/concepts/edit/propertyvalue/code-system-property-value-edit.component';
import {CodeSystemAssociationEditComponent} from './containers/concepts/edit/association/code-system-association-edit.component';
import {CodeSystemConceptViewComponent} from './containers/concepts/edit/code-system-concept-view.component';
import {MarinaQuillModule} from '@kodality-web/marina-quill';
import {ResourcesLibModule} from 'term-web/resources/_lib';
import {SequenceLibModule} from 'term-web/sequence/_lib/sequence-lib.module';
import {CodeSystemCompareComponent} from 'term-web/resources/code-system/containers/version/compare/code-system-compare.component';
import {ResourceModule} from 'term-web/resources/resource/resource.module';
import {CodeSystemSummaryComponent} from 'term-web/resources/code-system/containers/summary/code-system-summary.component';
import {CodeSystemInfoWidgetComponent} from 'term-web/resources/code-system/containers/summary/widgets/code-system-info-widget.component';
import {CodeSystemVersionsWidgetComponent} from 'term-web/resources/code-system/containers/summary/widgets/code-system-versions-widget.component';
import {CodeSystemValueSetAddComponent} from 'term-web/resources/code-system/containers/edit/valueset/code-system-value-set-add.component';
import {CodeSystemVersionSummaryComponent} from 'term-web/resources/code-system/containers/version/summary/code-system-version-summary.component';
import {CodeSystemVersionInfoWidgetComponent} from 'term-web/resources/code-system/containers/version/summary/widgets/code-system-version-info-widget.component';
import {CodeSystemConceptsComponent} from 'term-web/resources/code-system/containers/concepts/code-system-concepts.component';
import {CodeSystemVersionConceptsComponent} from 'term-web/resources/code-system/containers/version/concepts/code-system-version-concepts.component';
import {CodeSystemUnlinkedConceptsComponent} from 'term-web/resources/code-system/containers/summary/widgets/code-system-unlinked-concepts.component';
import {
  CodeSystemConceptsListConceptPreviewComponent
} from 'term-web/resources/code-system/containers/concepts/list/code-system-concepts-list-concept-preview.component';


export const CODE_SYSTEM_ROUTES: Routes = [
  {path: '', component: CodeSystemListComponent},
  {path: 'add', component: CodeSystemEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/edit', component: CodeSystemEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/summary', component: CodeSystemSummaryComponent},
  {path: ':id/concepts', component: CodeSystemConceptsComponent},

  {path: ':id/concepts/add', component: CodeSystemConceptEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/concepts/:conceptCode/edit', component: CodeSystemConceptEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/concepts/:conceptCode/view', component: CodeSystemConceptViewComponent},

  {path: ':id/versions/add', component: CodeSystemVersionEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/versions/:versionCode/summary', component: CodeSystemVersionSummaryComponent},
  {path: ':id/versions/:versionCode/concepts', component: CodeSystemVersionConceptsComponent},
  {path: ':id/versions/:versionCode/edit', component: CodeSystemVersionEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/versions/:versionCode/concepts/add', component: CodeSystemConceptEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/versions/:versionCode/concepts/:conceptCode/edit', component: CodeSystemConceptEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/versions/:versionCode/concepts/:conceptCode/view', component: CodeSystemConceptViewComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: 'compare', component: CodeSystemCompareComponent, data: {privilege: ['*.CodeSystem.view']}}
];

export const CODE_SYSTEM_FINDER_ROUTES: Routes = [{
  path: '', component: FinderCodeSystemListComponent, children: [{
    path: ':id', component: FinderCodeSystemViewComponent, children: [{
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
    ResourceModule
  ],
  declarations: [
    CodeSystemListComponent,
    CodeSystemEditComponent,
    CodeSystemDuplicateModalComponent,

    CodeSystemVersionEditComponent,
    CodeSystemVersionDuplicateModalComponent,

    CodeSystemConceptsListComponent,
    CodeSystemConceptsListConceptPreviewComponent,
    CodeSystemConceptViewComponent,
    CodeSystemConceptEditComponent,
    CodeSystemDesignationEditComponent,
    CodeSystemPropertyValueEditComponent,
    CodeSystemAssociationEditComponent,
    CodeSystemCompareComponent,
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
