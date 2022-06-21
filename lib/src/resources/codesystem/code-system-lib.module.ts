import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CodeSystemLibService} from './services/code-system-lib.service';
import {CodeSystemSearchComponent} from './containers/code-system-search.component';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {CodeSystemEntityVersionLibService} from './services/code-system-entity-version-lib.service';
import {ConceptSearchComponent} from './containers/concept-search.component';
import {CodeSystemConceptLibService} from './services/code-system-concept-lib.service';
import {CodeSystemVersionLibService} from './services/code-system-version-lib.service';
import {CodeSystemVersionSelectComponent} from './containers/code-system-version-select.component';
import {CodeSystemEntityVersionSearchComponent} from './containers/code-system-entity-version-search.component';
import {TranslateModule} from '@ngx-translate/core';
import {LocalizedConceptNamePipe} from './pipe/localized-concept-name-pipe';


@NgModule({
  imports: [
    CommonModule,
    MarinaUiModule,
    FormsModule,
    CoreUtilModule,
    TranslateModule
  ],
  providers: [
    CodeSystemLibService,
    CodeSystemEntityVersionLibService,
    CodeSystemConceptLibService,
    CodeSystemVersionLibService
  ],
  declarations: [
    CodeSystemSearchComponent,
    ConceptSearchComponent,
    CodeSystemVersionSelectComponent,
    CodeSystemEntityVersionSearchComponent,

    LocalizedConceptNamePipe
  ],
  exports: [
    CodeSystemSearchComponent,
    ConceptSearchComponent,
    CodeSystemVersionSelectComponent,
    CodeSystemEntityVersionSearchComponent,

    LocalizedConceptNamePipe
  ]
})
export class CodeSystemLibModule {
}
