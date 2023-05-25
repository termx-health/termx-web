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
import {AuthModule} from 'term-web/core/auth';
import {ValidateUrlPipe} from './pipes/validate-url.pipe';
import {CodeSystemLibModule, ValueSetLibModule} from '../../resources/_lib';
import {TerminologyConceptSearchComponent} from 'term-web/core/shared/components/terminology-concept-select/terminology-concept-search.component';
import {MeasurementUnitLibModule} from '../../measurement-unit/_lib';
import {IntegrationLibModule} from '../../integration/_lib';
import {SemanticVersionSelectComponent} from 'term-web/core/shared/components/version-select/semantic-version-select.component';
import {InputDebounceDirective} from 'term-web/core/shared/directives/input-debounce.directive';
import {EntityPropertyValueInputComponent} from 'term-web/core/shared/components/property-value-input/entity-property-value-input.component';


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
  AddButtonComponent,
  TerminologyConceptSearchComponent,
  SemanticVersionSelectComponent,
  EntityPropertyValueInputComponent,
];

const pipes = [
  ValidateUrlPipe,
];

const directives = [
  InputDebounceDirective
];


@NgModule({
  imports: [
    ...commonModules,
    CodeSystemLibModule,
    ValueSetLibModule,
    MeasurementUnitLibModule,
    IntegrationLibModule
  ],
  declarations: [
    ...components,
    ...pipes,
    ...directives
  ],
  exports: [
    ...commonModules,
    ...components,
    ...pipes,
    ...directives
  ]
})
export class SharedModule {
}
