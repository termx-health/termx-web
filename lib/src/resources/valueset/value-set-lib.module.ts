import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ValueSetLibService} from './services/value-set-lib.service';
import {ValueSetSearchComponent} from './containers/value-set-search.component';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {ValueSetVersionSelectComponent} from './containers/value-set-version-select.component';
import {ValueSetVersionLibService} from './services/value-set-version-lib.service';
import {ValueSetConceptSelectComponent} from './containers/value-set-concept-select.component';
import {CodeSystemLibModule} from '../codesystem';


@NgModule({
  imports: [
    CommonModule,
    MarinaUiModule,
    FormsModule,
    CoreUtilModule,
    CodeSystemLibModule
  ],
  providers: [
    ValueSetLibService,
    ValueSetVersionLibService
  ],
  declarations: [
    ValueSetSearchComponent,
    ValueSetVersionSelectComponent,
    ValueSetConceptSelectComponent
  ],
  exports: [
    ValueSetSearchComponent,
    ValueSetVersionSelectComponent,
    ValueSetConceptSelectComponent
  ]
})
export class ValueSetLibModule {
}
