import {NgModule} from '@angular/core';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {CoreUtilModule} from '@kodality-web/core-util';
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
