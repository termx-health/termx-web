import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreUtilModule} from '@kodality-web/core-util';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {MarinaUtilModule} from '@kodality-health/marina-util';
import {StatusTagComponent} from './components/publication-status-tag/status-tag.component';
import {AddButtonComponent} from './components/add-button/add-button.component';
import {CodeSystemLibModule} from 'terminology-lib/resources';
import {ValidateUrlPipe} from './pipes/validate-url.pipe';
import {HasAnyPrivilegePipe} from './pipes/has-any-privilege.pipe';
import {PrivilegeDirective} from './directives/privilege.directive';


const commonModules = [
  CommonModule,
  RouterModule,
  FormsModule,
  TranslateModule,
  MarinaUiModule,
  MarinaUtilModule,
  CoreUtilModule
];

const components = [
  StatusTagComponent,
  AddButtonComponent
];

const pipes = [
  ValidateUrlPipe,
  HasAnyPrivilegePipe
];

const directives = [
  ValidateUrlPipe,
  PrivilegeDirective
];

@NgModule({
  imports: [...commonModules, CodeSystemLibModule],
  exports: [
    ...commonModules,
    ...components,
    ...pipes,
    ...directives
  ],
  declarations: [
    ...components,
    ...pipes,
    ...directives
  ]
})
export class SharedModule {
}
