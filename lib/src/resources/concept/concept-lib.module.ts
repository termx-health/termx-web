import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConceptSearchComponent} from './containers/concept-search.component';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {CoreUtilModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {ConceptLibService} from './services/concept-lib.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MarinaUiModule,
    CoreUtilModule
  ],
  declarations: [
    ConceptSearchComponent
  ],
  exports: [
    ConceptSearchComponent
  ],
  providers: [
    ConceptLibService
  ]
})
export class ConceptLibModule {
}
