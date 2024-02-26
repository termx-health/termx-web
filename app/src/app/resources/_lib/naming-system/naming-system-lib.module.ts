import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';
import {MarinaComponentsModule} from '@kodality-web/marina-ui';
import {NamingSystemSearchComponent} from './containers/naming-system-search.component';
import {NamingSystemLibService} from './services/naming-system-lib.service';

@NgModule({
  imports: [
    MarinaComponentsModule,
    FormsModule,
    CommonModule,
    CoreUtilModule
  ],
  providers: [
    NamingSystemLibService
  ],
  declarations: [
    NamingSystemSearchComponent
  ],
  exports: [
    NamingSystemSearchComponent
  ]
})

export class NamingSystemLibModule {
}
