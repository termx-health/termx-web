import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {UcumComponentsLibService} from './services/ucum-components-lib.service';
import {UcumOperationsLibService} from "./services/ucum-operations-lib.service";

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule,
    MarinaUtilModule,
    CoreUtilModule,
    CommonModule,
  ],
  providers: [
    UcumComponentsLibService,
    UcumOperationsLibService
  ]

})
export class UcumLibModule {
}
