import {NgModule} from '@angular/core';
import {DesignationLibService} from './services/designation-lib.service';
import {DesignationSelectComponent} from './containers/designation-select/designation-select.component';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {CorePipesModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';


@NgModule({
  imports: [
    MarinaUiModule,
    CorePipesModule,
    FormsModule
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
