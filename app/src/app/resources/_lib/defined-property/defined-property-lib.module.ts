import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {DefinedPropertyLibService} from './services/defined-property-lib.service';

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
