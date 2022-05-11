import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConceptSearchInputComponent} from './containers/concept-search-input.component';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {CoreUtilModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    MarinaUiModule,
    CoreUtilModule,
    FormsModule
  ],
  declarations: [
    ConceptSearchInputComponent
  ],
  exports: [
    ConceptSearchInputComponent
  ]
})
export class ConceptLibModule {
}
