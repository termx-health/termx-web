import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CodeSystemListComponent} from './containers/list/code-system-list.component';
import {CodeSystemPropertiesListComponent} from './containers/edit/property/code-system-properties-list.component';
import {CodeSystemVersionsListComponent} from './containers/edit/version/code-system-versions-list.component';
import {CodeSystemEditComponent} from './containers/edit/code-system-edit.component';
import {CodeSystemVersionEditComponent} from './containers/version/code-system-version-edit.component';
import {SharedModule} from '../../core/shared/shared.module';
import {CodeSystemService} from './services/code-system.service';
import {CodeSystemVersionViewComponent} from './containers/version/code-system-version-view.component';
import {CodeSystemDuplicateModalComponent} from './containers/list/code-system-duplicate-modal.component';
import {CodeSystemConceptsListComponent} from './containers/edit/concept/code-system-concepts-list.component';
import {CodeSystemVersionDuplicateModalComponent} from './containers/edit/version/code-system-version-duplicate-modal.component';
import {CodeSystemVersionEntityVersionsListComponent} from './containers/version/code-system-version-entity-versions-list.component';
import {FinderCodeSystemListComponent} from './containers-finder/code-system-list.component';
import {FinderCodeSystemViewComponent} from './containers-finder/code-system-view.component';
import {FinderCodeSystemVersionViewComponent} from './containers-finder/version/code-system-version-view.component';
import {FinderCodeSystemConceptViewComponent} from './containers-finder/concept/code-system-concept-view.component';
import {FinderCodeSystemConceptVersionViewComponent} from './containers-finder/concept/code-system-concept-version-view.component';
import {FinderModule} from '../../core/finder/finder.module';
import {ContactModule} from '../contact/contact.module';
import {ResourcesLibModule} from '@terminology/core';
import {CodeSystemPropertyEditComponent} from './containers/edit/property/code-system-property-edit.component';
import {CodeSystemPropertyFormComponent} from './containers/edit/property/code-system-property-form.component';
import {CodeSystemSupplementEditComponent} from './containers/supplement/code-system-supplement-edit.component';
import {CodeSystemViewComponent} from './containers/edit/code-system-view.component';
import {CodeSystemConceptEditComponent} from './containers/concept/code-system-concept-edit.component';
import {CodeSystemDesignationGroupEditComponent} from './containers/concept/designation/code-system-designation-group-edit.component';
import {CodeSystemDesignationEditComponent} from './containers/concept/designation/code-system-designation-edit.component';
import {CodeSystemPropertyValueEditComponent} from './containers/concept/propertyvalue/code-system-property-value-edit.component';
import {CodeSystemAssociationEditComponent} from './containers/concept/association/code-system-association-edit.component';
import {CodeSystemConceptViewComponent} from './containers/concept/code-system-concept-view.component';
import {CodeSystemConceptRelationsComponent} from './containers/concept/relations/code-system-concept-relations.component';
import {MarinaQuillModule} from '@kodality-web/marina-quill';


export const CODE_SYSTEM_ROUTES: Routes = [
  {path: 'add', component: CodeSystemEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/edit', component: CodeSystemEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/view', component: CodeSystemViewComponent},

  {path: ':id/concepts/add', component: CodeSystemConceptEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/concepts/:conceptCode/edit', component: CodeSystemConceptEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/concepts/:conceptCode/view', component: CodeSystemConceptViewComponent},
  {path: ':id/versions/:versionCode/concepts/add', component: CodeSystemConceptEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/versions/:versionCode/concepts/:conceptCode/edit', component: CodeSystemConceptEditComponent, data: {privilege: ['*.CodeSystem.edit']}},

  {path: ':id/entity-properties/add', component: CodeSystemPropertyEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/entity-properties/:propertyId/edit', component: CodeSystemPropertyEditComponent, data: {privilege: ['*.CodeSystem.edit']}},

  {path: ':id/supplements/add', component: CodeSystemSupplementEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/supplements/:supplementId/edit', component: CodeSystemSupplementEditComponent, data: {privilege: ['*.CodeSystem.edit']}},

  {path: ':id/versions/add', component: CodeSystemVersionEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/versions/:versionCode/edit', component: CodeSystemVersionEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/versions/:versionCode/view', component: CodeSystemVersionViewComponent},
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
    SharedModule,
    FinderModule,
    ResourcesLibModule,
    ContactModule,
    MarinaQuillModule
  ],
  declarations: [
    CodeSystemListComponent,
    CodeSystemEditComponent,
    CodeSystemViewComponent,
    CodeSystemDuplicateModalComponent,

    CodeSystemPropertiesListComponent,
    CodeSystemPropertyFormComponent,
    CodeSystemPropertyEditComponent,
    CodeSystemPropertyFormComponent,
    CodeSystemPropertyEditComponent,
    CodeSystemSupplementEditComponent,

    CodeSystemVersionsListComponent,
    CodeSystemVersionEditComponent,
    CodeSystemVersionViewComponent,
    CodeSystemVersionDuplicateModalComponent,
    CodeSystemVersionEntityVersionsListComponent,

    CodeSystemConceptsListComponent,
    CodeSystemConceptViewComponent,
    CodeSystemConceptEditComponent,
    CodeSystemDesignationEditComponent,
    CodeSystemDesignationGroupEditComponent,
    CodeSystemPropertyValueEditComponent,
    CodeSystemAssociationEditComponent,
    CodeSystemConceptRelationsComponent,

    FinderCodeSystemListComponent,
    FinderCodeSystemViewComponent,
    FinderCodeSystemVersionViewComponent,
    FinderCodeSystemConceptViewComponent,
    FinderCodeSystemConceptVersionViewComponent
  ],
  exports: [
    CodeSystemListComponent,
    CodeSystemConceptsListComponent,
    CodeSystemConceptRelationsComponent
  ],
  providers: [
    CodeSystemService
  ]
})
export class CodeSystemModule {
}
