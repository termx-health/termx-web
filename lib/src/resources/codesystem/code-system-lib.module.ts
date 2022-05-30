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


@NgModule({
  imports: [
    CommonModule,
    MarinaUiModule,
    FormsModule,
    CoreUtilModule
  ],
  providers: [
    CodeSystemLibService,
    CodeSystemEntityVersionLibService,
    CodeSystemConceptLibService
  ],
  declarations: [
    CodeSystemSearchComponent,
    ConceptSearchComponent
  ],
  exports: [
    CodeSystemSearchComponent,
    ConceptSearchComponent
  ]
})
export class CodeSystemLibModule {
}
