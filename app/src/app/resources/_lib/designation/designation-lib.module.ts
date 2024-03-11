import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CorePipesModule} from '@kodality-web/core-util';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {DesignationSelectComponent} from './containers/designation-select/designation-select.component';
import {DesignationLibService} from './services/designation-lib.service';


@NgModule({
  imports: [
    MarinaUiModule,
    CorePipesModule,
    FormsModule,
    CommonModule
  ],
  providers: [
    DesignationLibService
  ],
  declarations: [
    DesignationSelectComponent
  ],
  exports: [
    DesignationSelectComponent
  ]
})
export class DesignationLibModule {
}
