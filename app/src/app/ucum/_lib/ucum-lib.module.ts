import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {UcumSearchComponent} from './containers/ucum-search.component';
import {UcumLibService} from './services/ucum-lib.service';

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule,
    MarinaUtilModule,
    CoreUtilModule,
    CommonModule,
  ],
  declarations: [
    UcumSearchComponent
  ],
  exports: [
    UcumSearchComponent
  ],
  providers: [
    UcumLibService
  ]

})
export class UcumLibModule {
}
