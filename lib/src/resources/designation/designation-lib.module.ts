import {NgModule} from '@angular/core';
import {DesignationLibService} from './services/designation-lib.service';
import {DesignationSelectComponent} from './containers/designation-select/designation-select.component';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {CorePipesModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {DesignationMultiLanguageInputComponent} from './containers/designation-multi-language-input/designation-multi-language-input.component';
import {ValueSetLibModule} from '../valueset';
import {TranslateModule} from '@ngx-translate/core';


@NgModule({
  imports: [
    MarinaUiModule,
    CorePipesModule,
    FormsModule,
    CommonModule,
    ValueSetLibModule,
    TranslateModule
  ],
  providers: [
    DesignationLibService
  ],
  declarations: [
    DesignationSelectComponent,
    DesignationMultiLanguageInputComponent
  ],
  exports: [
    DesignationSelectComponent,
    DesignationMultiLanguageInputComponent
  ]
})
export class DesignationLibModule {
}
