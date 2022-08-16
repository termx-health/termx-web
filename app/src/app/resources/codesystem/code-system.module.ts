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
import {CodeSystemConceptEditComponent} from './containers/concept/code-system-concept-edit.component';
import {CodeSystemVersionDuplicateModalComponent} from './containers/edit/version/code-system-version-duplicate-modal.component';
import {CodeSystemVersionEntityVersionsListComponent} from './containers/version/code-system-version-entity-versions-list.component';
import {CodeSystemConceptVersionEditComponent} from './containers/concept/code-system-concept-version-edit.component';
import {FinderCodeSystemListComponent} from './containers-finder/code-system-list.component';
import {FinderCodeSystemViewComponent} from './containers-finder/code-system-view.component';
import {FinderCodeSystemVersionViewComponent} from './containers-finder/version/code-system-version-view.component';
import {FinderCodeSystemConceptViewComponent} from './containers-finder/concept/code-system-concept-view.component';
import {FinderCodeSystemConceptVersionViewComponent} from './containers-finder/concept/code-system-concept-version-view.component';
import {FinderModule} from '../../core/finder/finder.module';
import {ContactModule} from '../contact/contact.module';
import {CodeSystemConceptVersionDesignationTableComponent} from './containers/concept/designation/code-system-concept-version-designation-table.component';
import {
  CodeSystemConceptVersionPropertyValueTableComponent
} from './containers/concept/propertyvalue/code-system-concept-version-property-value-table.component';
import {CodeSystemConceptVersionViewComponent} from './containers/concept/code-system-concept-version-view.component';
import {ResourcesLibModule} from 'terminology-lib/resources';
import {CodeSystemPropertyEditComponent} from './containers/property/code-system-property-edit.component';
import {CodeSystemPropertyFormComponent} from './containers/property/code-system-property-form.component';
import {CodeSystemSupplementEditComponent} from './containers/supplement/code-system-supplement-edit.component';
import {CodeSystemDesignationEditComponent} from './containers/designation/code-system-designation-edit.component';
import {CodeSystemDesignationFormComponent} from './containers/designation/code-system-designation-form.component';
import {CodeSystemPropertyValueFormComponent} from './containers/property-value/code-system-property-value-form.component';
import {CodeSystemPropertyValueEditComponent} from './containers/property-value/code-system-property-value-edit.component';
import {CodeSystemConceptVersionAssociationTableComponent} from './containers/concept/association/code-system-concept-version-association-table.component';
import {CodeSystemAssociationEditComponent} from './containers/association/code-system-association-edit.component';
import {CodeSystemViewComponent} from './containers/edit/code-system-view.component';
import {CodeSystemConceptViewComponent} from './containers/concept/code-system-concept-view.component';


export const CODE_SYSTEM_ROUTES: Routes = [
  {path: 'add', component: CodeSystemEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/edit', component: CodeSystemEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/view', component: CodeSystemViewComponent},

  {path: ':id/concepts/add', component: CodeSystemConceptEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/concepts/:conceptId/edit', component: CodeSystemConceptEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {path: ':id/concepts/:conceptId/view', component: CodeSystemConceptViewComponent},
  {path: ':id/concepts/:conceptId/versions/add', component: CodeSystemConceptVersionEditComponent, data: {privilege: ['*.CodeSystem.edit']}},
  {
    path: ':id/concepts/:conceptId/versions/:conceptVersionId/edit',
    component: CodeSystemConceptVersionEditComponent,
    data: {privilege: ['*.CodeSystem.edit']}
  },
  {path: ':id/concepts/:conceptId/versions/:conceptVersionId/view', component: CodeSystemConceptVersionViewComponent},
  {
    path: ':id/concepts/:conceptId/versions/:conceptVersionId/entity-property-value/add',
    component: CodeSystemPropertyValueEditComponent,
    data: {privilege: ['*.CodeSystem.edit']}
  },
  {
    path: ':id/concepts/:conceptId/versions/:conceptVersionId/entity-property-value/:propertyValueId/edit',
    component: CodeSystemPropertyValueEditComponent,
    data: {privilege: ['*.CodeSystem.edit']}
  },
  {
    path: ':id/concepts/:conceptId/versions/:conceptVersionId/designations/add',
    component: CodeSystemDesignationEditComponent,
    data: {privilege: ['*.CodeSystem.edit']}
  },
  {
    path: ':id/concepts/:conceptId/versions/:conceptVersionId/designations/:designation/edit',
    component: CodeSystemDesignationEditComponent,
    data: {privilege: ['*.CodeSystem.edit']}
  },
  {
    path: ':id/concepts/:conceptId/versions/:conceptVersionId/associations/add',
    component: CodeSystemAssociationEditComponent,
    data: {privilege: ['*.CodeSystem.edit']}
  },
  {
    path: ':id/concepts/:conceptId/versions/:conceptVersionId/associations/:association/edit',
    component: CodeSystemAssociationEditComponent,
    data: {privilege: ['*.CodeSystem.edit']}
  },

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
      path: 'concepts/:conceptId', component: FinderCodeSystemConceptViewComponent, children: [{
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
    ContactModule
  ],
  declarations: [
    CodeSystemListComponent,
    CodeSystemEditComponent,
    CodeSystemPropertiesListComponent,
    CodeSystemVersionsListComponent,
    CodeSystemVersionEditComponent,
    CodeSystemVersionViewComponent,
    CodeSystemDuplicateModalComponent,
    CodeSystemConceptsListComponent,
    CodeSystemConceptEditComponent,
    CodeSystemVersionDuplicateModalComponent,
    CodeSystemConceptEditComponent,
    CodeSystemVersionEntityVersionsListComponent,
    CodeSystemConceptVersionEditComponent,
    CodeSystemConceptVersionViewComponent,
    CodeSystemConceptVersionDesignationTableComponent,
    CodeSystemConceptVersionPropertyValueTableComponent,

    FinderCodeSystemListComponent,
    FinderCodeSystemViewComponent,
    FinderCodeSystemVersionViewComponent,
    FinderCodeSystemConceptViewComponent,
    FinderCodeSystemConceptVersionViewComponent,
    CodeSystemPropertyFormComponent,
    CodeSystemPropertyEditComponent,
    CodeSystemSupplementEditComponent,
    CodeSystemDesignationEditComponent,
    CodeSystemDesignationFormComponent,
    CodeSystemPropertyValueEditComponent,
    CodeSystemPropertyValueFormComponent,
    CodeSystemConceptVersionAssociationTableComponent,
    CodeSystemAssociationEditComponent,
    CodeSystemViewComponent,
    CodeSystemConceptViewComponent
  ],
  exports: [
    CodeSystemListComponent,
    CodeSystemPropertyValueFormComponent,
    CodeSystemConceptsListComponent
  ],
  providers: [
    CodeSystemService
  ]
})
export class CodeSystemModule {
}
