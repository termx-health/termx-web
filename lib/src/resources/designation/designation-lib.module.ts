import {NgModule} from '@angular/core';
import {DesignationLibService} from './services/designation-lib.service';
import {DesignationSelectComponent} from './containers/designation-select/designation-select.component';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {CorePipesModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';


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
