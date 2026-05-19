import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@termx-health/core-util';
import {BobLibService} from 'term-web/sys/_lib/bob/services/bob-lib.service';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    CoreUtilModule
  ],
  providers: [
    BobLibService,
  ]
})
export class BobLibModule {
}
