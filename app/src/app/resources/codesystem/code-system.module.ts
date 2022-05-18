import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {CodeSystemListComponent} from './containers/code-system-list.component';
import {CodeSystemFormComponent} from './containers/edit/code-system-form.component';
import {CodeSystemLibModule} from 'terminology-lib/resources';
import {CodeSystemPropertiesListComponent} from './containers/edit/code-system-properties-list.component';
import {CodeSystemVersionsListComponent} from './containers/edit/code-system-versions-list.component';
import {CodeSystemEditComponent} from './containers/edit/code-system-edit.component';
import {CodeSystemVersionEditComponent} from './containers/version/code-system-version-edit.component';
import {SharedModule} from '../../shared/shared.module';
import {CodeSystemService} from './services/code-system.service';


export const CODE_SYSTEM_TAB_ROUTES: Routes = [
  {path: '', component: CodeSystemListComponent},
];

export const CODE_SYSTEM_ROUTES: Routes = [
  {path: 'add', component: CodeSystemEditComponent},
  {path: ':id/edit', component: CodeSystemEditComponent},
  {path: ':id/versions/add', component: CodeSystemVersionEditComponent},
  {path: ':id/versions/:version/edit', component: CodeSystemVersionEditComponent},
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
  ],
  providers: [
    CodeSystemService
  ]
})
export class CodeSystemModule {
}
