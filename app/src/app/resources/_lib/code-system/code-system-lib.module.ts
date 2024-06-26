import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {TranslateModule} from '@ngx-translate/core';
import {IntegrationLibModule} from 'term-web/integration/_lib';
import {CodeSystemConceptMatrixComponent} from 'term-web/resources/_lib/code-system/containers/code-system-concept-matrix.component';
import {ConceptDrawerSearchComponent} from 'term-web/resources/_lib/code-system/containers/concept-drawer-search.component';
import {CodeSystemFileImportService} from 'term-web/resources/_lib/code-system/services/code-system-file-import.service';
import {CodeSystemEntityVersionSearchComponent} from './containers/code-system-entity-version-search.component';
import {CodeSystemSearchComponent} from './containers/code-system-search.component';
import {CodeSystemVersionSelectComponent} from './containers/code-system-version-select.component';
import {CodeSystemWidgetComponent} from './containers/code-system-widget.component';
import {ConceptSearchComponent} from './containers/concept-search.component';
import {EntityPropertyNamePipe} from './pipe/entity-propertye-name-pipe';
import {LocalizedConceptNamePipe} from './pipe/localized-concept-name-pipe';
import {CodeSystemConceptLibService} from './services/code-system-concept-lib.service';
import {CodeSystemEntityVersionLibService} from './services/code-system-entity-version-lib.service';
import {CodeSystemLibService} from './services/code-system-lib.service';
import {CodeSystemVersionLibService} from './services/code-system-version-lib.service';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MarinaUiModule,
    FormsModule,
    CoreUtilModule,
    TranslateModule,
    MarinaUtilModule,
    IntegrationLibModule
  ],
  providers: [
    CodeSystemLibService,
    CodeSystemEntityVersionLibService,
    CodeSystemFileImportService,
    CodeSystemConceptLibService,
    CodeSystemVersionLibService
  ],
  declarations: [
    CodeSystemSearchComponent,
    ConceptSearchComponent,
    ConceptDrawerSearchComponent,
    CodeSystemVersionSelectComponent,
    CodeSystemEntityVersionSearchComponent,
    CodeSystemWidgetComponent,
    CodeSystemConceptMatrixComponent,

    LocalizedConceptNamePipe,
    EntityPropertyNamePipe,
  ],
  exports: [
    CodeSystemSearchComponent,
    ConceptSearchComponent,
    ConceptDrawerSearchComponent,
    CodeSystemVersionSelectComponent,
    CodeSystemEntityVersionSearchComponent,
    CodeSystemWidgetComponent,
    CodeSystemConceptMatrixComponent,

    LocalizedConceptNamePipe,
    EntityPropertyNamePipe,
  ]
})
export class CodeSystemLibModule {
}
