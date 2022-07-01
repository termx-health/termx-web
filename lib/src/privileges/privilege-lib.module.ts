import {NgModule} from '@angular/core';
import {PrivilegeLibService} from './services/privilege-lib.service';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {FormsModule} from '@angular/forms';
import {CorePipesModule} from '@kodality-web/core-util';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [
    MarinaUiModule,
    FormsModule,
    CorePipesModule,
    CommonModule,
  ],
  providers: [
    PrivilegeLibService
  ]
})

export class PrivilegeLibModule {
}