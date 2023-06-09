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
import {TerminologyConceptSearchComponent} from 'term-web/core/ui/components/inputs/terminology-concept-select/terminology-concept-search.component';
import {MeasurementUnitLibModule} from '../../measurement-unit/_lib';
import {IntegrationLibModule} from '../../integration/_lib';
import {SemanticVersionSelectComponent} from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import {InputDebounceDirective} from 'term-web/core/ui/directives/input-debounce.directive';
import {EntityPropertyValueInputComponent} from 'term-web/core/ui/components/inputs/property-value-input/entity-property-value-input.component';
import {TableComponent} from 'term-web/core/ui/components/table-container/table.component';
import {TableFilterComponent} from 'term-web/core/ui/components/table-container/table-filter.component';
import {DropListComponent} from 'term-web/core/ui/components/drop-list/drop-list.component';
import {DragDropModule} from '@angular/cdk/drag-drop';


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
  AddButtonComponent,
  EntityPropertyValueInputComponent,
  SemanticVersionSelectComponent,
  StatusTagComponent,
  TableComponent,
  TableFilterComponent,
  TerminologyConceptSearchComponent,
  DropListComponent
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
    DragDropModule,

    CodeSystemLibModule,
    ValueSetLibModule,
    MeasurementUnitLibModule,
    IntegrationLibModule,
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
export class CoreUiModule {
}
