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


export const CODE_SYSTEM_ROUTES: Routes = [
  {path: '', component: CodeSystemListComponent},
  {path: 'edit/:id', component: CodeSystemFormComponent},
  {path: 'add', component: CodeSystemFormComponent}
];

@NgModule({
  declarations: [
    CodeSystemListComponent,
    CodeSystemFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    CodeSystemLibModule,
    MarinaUiModule,
    MarinaUtilModule,
  ]
})
export class CodeSystemModule {
}
