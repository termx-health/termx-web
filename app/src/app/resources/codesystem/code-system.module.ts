import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CodeSystemListComponent} from './containers/list/code-system-list.component';
import {CodeSystemFormComponent} from './containers/edit/code-system-form.component';
import {CodeSystemLibModule} from 'terminology-lib/resources';
import {CodeSystemPropertiesListComponent} from './containers/edit/code-system-properties-list.component';
import {CodeSystemVersionsListComponent} from './containers/edit/code-system-versions-list.component';
import {CodeSystemEditComponent} from './containers/edit/code-system-edit.component';
import {CodeSystemVersionEditComponent} from './containers/version/code-system-version-edit.component';
import {SharedModule} from '../../core/shared/shared.module';
import {CodeSystemService} from './services/code-system.service';
import {CodeSystemVersionViewComponent} from './containers/version/code-system-version-view.component';
import {CodeSystemDuplicateModalComponent} from './containers/list/code-system-duplicate-modal.component';
import {CodeSystemConceptsListComponent} from './containers/edit/code-system-concepts-list.component';
import {CodeSystemConceptEditComponent} from './containers/concept/code-system-concept-edit.component';
import {CodeSystemEntityVersionService} from './services/code-system-entity-version.service';
import {CodeSystemVersionDuplicateModalComponent} from './containers/edit/code-system-version-duplicate-modal.component';


export const CODE_SYSTEM_ROUTES: Routes = [
  {path: 'add', component: CodeSystemEditComponent},
  {path: ':id/edit', component: CodeSystemEditComponent},
  {path: ':id/concepts/add', component: CodeSystemConceptEditComponent},
  {path: ':id/concepts/:concept/edit', component: CodeSystemConceptEditComponent},
  {path: ':id/versions/add', component: CodeSystemVersionEditComponent},
  {path: ':id/versions/:version/edit', component: CodeSystemVersionEditComponent},
  {path: ':id/versions/:version/view', component: CodeSystemVersionViewComponent},
];

@NgModule({
  imports: [
    SharedModule,
    CodeSystemLibModule,
  ],
  declarations: [
    CodeSystemListComponent,
    CodeSystemEditComponent,
    CodeSystemFormComponent,
    CodeSystemPropertiesListComponent,
    CodeSystemVersionsListComponent,
    CodeSystemVersionEditComponent,
    CodeSystemVersionViewComponent,
    CodeSystemDuplicateModalComponent,
    CodeSystemConceptsListComponent,
    CodeSystemConceptEditComponent,
    CodeSystemVersionDuplicateModalComponent
  ],
  exports: [
    CodeSystemListComponent
  ],
  providers: [
    CodeSystemService,
    CodeSystemEntityVersionService
  ]
})
export class CodeSystemModule {
}
