import {NgModule} from '@angular/core';
import {DesignationLibService} from './services/designation-lib.service';
import {DesignationSelectComponent} from './containers/designation-select/designation-select.component';
import {SharedModule} from '../../../../app/src/app/shared/shared.module';


@NgModule({
  providers: [
    DesignationLibService
  ],
  declarations: [
    DesignationSelectComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    DesignationSelectComponent
  ]
})
export class DesignationLibModule {
}
