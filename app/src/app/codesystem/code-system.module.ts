import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CodeSystemListComponent} from './containers/code-system-list.component';
import {CodeSystemFormComponent} from './containers/code-system-form.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {CodeSystemLibModule} from 'terminology-lib/codesystem';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {MarinaUtilModule} from '@kodality-health/marina-util';
import {CoreUtilModule} from '@kodality-web/core-util';
import {CodeSystemFormPropertiesComponent} from './containers/code-system-form-properties.component';
import {CodeSystemFormVersionsComponent} from './containers/code-system-form-versions.component';
import {CodeSystemEditComponent} from './containers/code-system-edit.component';
import {CodeSystemVersionEditComponent} from './containers/code-system-version-edit.component';


export const CODE_SYSTEM_ROUTES: Routes = [
  {path: '', component: CodeSystemListComponent},
  {path: 'add', component: CodeSystemEditComponent},
  {path: ':id/edit', component: CodeSystemEditComponent},
  {path: ':id/versions/add', component: CodeSystemVersionEditComponent},
  {path: ':id/versions/:versionId/edit', component: CodeSystemVersionEditComponent},
];

@NgModule({
  declarations: [
    CodeSystemListComponent,
    CodeSystemEditComponent,
    CodeSystemFormComponent,
    CodeSystemFormPropertiesComponent,
    CodeSystemFormVersionsComponent,
    CodeSystemVersionEditComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    CodeSystemLibModule,

    MarinaUiModule,
    MarinaUtilModule,
    CoreUtilModule,
  ]
})
export class CodeSystemModule {
}
