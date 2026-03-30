import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaComponentsModule} from '@termx-health/ui';
import {MarinaUtilModule} from '@termx-health/util';
import {UcumLibService} from './services/ucum-lib.service';

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule,
    MarinaUtilModule,
    CoreUtilModule,
    CommonModule,
  ],
  providers: [
    UcumLibService,
  ]

})
export class UcumLibModule {
}
