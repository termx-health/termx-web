import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreUtilModule} from '@kodality-web/core-util';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {StatusTagComponent} from './components/publication-status-tag/status-tag.component';
import {AddButtonComponent} from './components/add-button/add-button.component';
import {AuthModule, CodeSystemLibModule} from '@terminology/core';
import {ValidateUrlPipe} from './pipes/validate-url.pipe';


const commonModules = [
  CommonModule,
  RouterModule,
  FormsModule,
  TranslateModule,
  MarinaUiModule,
  MarinaUtilModule,
  CoreUtilModule,
  AuthModule
];

const components = [
  StatusTagComponent,
  AddButtonComponent
];

const pipes = [
  ValidateUrlPipe,
];

const directives = [
  ValidateUrlPipe,
];

@NgModule({
  imports: [
    ...commonModules,
    CodeSystemLibModule
  ],
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
