import {NgModule} from '@angular/core';
import {ImplementationGuideLibService} from './services/implementation-guide-lib.service';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [
    FormsModule,
    MarinaComponentsModule,
    MarinaUtilModule,
    CoreUtilModule,
    CommonModule,
  ],
  providers: [
    ImplementationGuideLibService
  ]

})
export class ImplementationGuideLibModule {
}
