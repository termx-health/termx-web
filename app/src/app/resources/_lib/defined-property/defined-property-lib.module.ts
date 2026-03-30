import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@termx-health/core-util';
import {MarinaComponentsModule} from '@termx-health/ui';
import {DefinedPropertyLibService} from 'term-web/resources/_lib/defined-property/services/defined-property-lib.service';

@NgModule({
  imports: [
    MarinaComponentsModule,
    FormsModule,
    CommonModule,
    CoreUtilModule
  ],
  providers: [DefinedPropertyLibService]
})
export class DefinedPropertyLibModule {
}
