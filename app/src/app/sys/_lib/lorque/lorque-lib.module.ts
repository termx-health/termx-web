import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaComponentsModule} from '@termx-health/ui';
import {LorqueLibService} from 'term-web/sys/_lib/lorque/services/lorque-lib.service';

@NgModule({
  imports: [
    MarinaComponentsModule,
    FormsModule,
    CommonModule,
    CoreUtilModule
  ],
  providers: [
    LorqueLibService,
  ]
})
export class LorqueLibModule {
}
