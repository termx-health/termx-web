import {NgModule} from '@angular/core';
import {NamingSystemLibService} from './services/naming-system-lib.service';
import {NamingSystemSearchComponent} from './containers/naming-system-search.component';
import {MuiComponentsModule} from '@kodality-health/marina-ui';
import {CorePipesModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@NgModule({
  providers: [
    NamingSystemLibService
  ],
  declarations: [
    NamingSystemSearchComponent
  ],
  imports: [
    MuiComponentsModule,
    CorePipesModule,
    FormsModule,
    CommonModule
  ],
  exports: [
    NamingSystemSearchComponent
  ]
})

export class NamingSystemLibModule {
}