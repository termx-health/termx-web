import {NgModule} from '@angular/core';
import {NamingSystemLibService} from './services/naming-system-lib.service';
import {NamingSystemSearchComponent} from './containers/naming-system-search.component';
import {MuiComponentsModule} from '@kodality-health/marina-ui';
import {CoreUtilModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [
    MuiComponentsModule,
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