import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ValueSetLibService} from './services/value-set-lib.service';
import {ValueSetSearchComponent} from './containers/value-set-search.component';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {ValueSetVersionSelectComponent} from './containers/value-set-version-select.component';
import {ValueSetVersionLibService} from './services/value-set-version-lib.service';


@NgModule({
  imports: [
    CommonModule,
    MarinaUiModule,
    FormsModule,
    CoreUtilModule
  ],
  providers: [
    ValueSetLibService,
    ValueSetVersionLibService
  ],
  declarations: [
    ValueSetSearchComponent,
    ValueSetVersionSelectComponent
  ],
  exports: [
    ValueSetSearchComponent,
    ValueSetVersionSelectComponent
  ]
})
export class ValueSetLibModule {
}
