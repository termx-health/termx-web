import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {TranslateModule} from '@ngx-translate/core';
import {AuthModule} from 'term-web/core/auth';
import {IntegrationLibModule} from '../../integration/_lib';
import {MeasurementUnitLibModule} from '../../measurement-unit/_lib';
import {CodeSystemLibModule, ValueSetLibModule} from '../../resources/_lib';
import {AddButtonComponent} from './components/add-button/add-button.component';
import {CopyContainerComponent} from './components/copy-container/copy-container.component';
import {DiffViewComponent} from './components/diff/diff-view.component';
import {DropListComponent} from './components/drop-list/drop-list.component';
import {EntityPropertyValueInputComponent} from './components/inputs/property-value-input/entity-property-value-input.component';
import {TerminologyConceptSearchComponent} from './components/inputs/terminology-concept-select/terminology-concept-search.component';
import {SemanticVersionSelectComponent} from './components/inputs/version-select/semantic-version-select.component';
import {StatusTagComponent} from './components/publication-status-tag/status-tag.component';
import {TableFilterComponent} from './components/table-container/table-filter.component';
import {TableComponent} from './components/table-container/table.component';
import {InputDebounceDirective} from './directives/input-debounce.directive';
import {ValidateUrlPipe} from './pipes/validate-url.pipe';
import {SeoService} from './services/seo.service';


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
  CopyContainerComponent,
  DropListComponent,
  EntityPropertyValueInputComponent,
  SemanticVersionSelectComponent,
  StatusTagComponent,
  TableComponent,
  TableFilterComponent,
  TerminologyConceptSearchComponent,
  DiffViewComponent
];

const directives = [
  InputDebounceDirective
];

const pipes = [
  ValidateUrlPipe,
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
  ],
  providers: [
    SeoService,
  ]
})
export class CoreUiModule {
}
