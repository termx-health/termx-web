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
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {MeasurementUnitLibModule} from 'term-web/measurement-unit/_lib';
import {CodeSystemLibModule, ValueSetLibModule} from 'term-web/resources/_lib';
import {AddButtonComponent} from 'term-web/core/ui/components/add-button/add-button.component';
import {CopyContainerComponent} from 'term-web/core/ui/components/copy-container/copy-container.component';
import {DiffViewComponent} from 'term-web/core/ui/components/diff/diff-view.component';
import {DropListComponent} from 'term-web/core/ui/components/drop-list/drop-list.component';
import {EntityPropertyValueInputComponent} from 'term-web/core/ui/components/inputs/property-value-input/entity-property-value-input.component';
import {TerminologyConceptSearchComponent} from 'term-web/core/ui/components/inputs/terminology-concept-select/terminology-concept-search.component';
import {SemanticVersionSelectComponent} from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import {StatusTagComponent} from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import {TableFilterComponent} from 'term-web/core/ui/components/table-container/table-filter.component';
import {TableComponent} from 'term-web/core/ui/components/table-container/table.component';
import {InputDebounceDirective} from 'term-web/core/ui/directives/input-debounce.directive';
import {ValidateUrlPipe} from 'term-web/core/ui/pipes/validate-url.pipe';
import {SeoService} from 'term-web/core/ui/services/seo.service';


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
        ...components,
        ...pipes,
        ...directives,
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
