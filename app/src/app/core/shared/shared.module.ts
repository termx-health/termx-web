import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreUtilModule} from '@kodality-web/core-util';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {MarinaUtilModule} from '@kodality-health/marina-util';


const commonModules = [
  CommonModule,
  RouterModule,
  FormsModule,
  TranslateModule,
  MarinaUiModule,
  MarinaUtilModule,
  CoreUtilModule,
];

@NgModule({
  imports: [...commonModules],
  exports: [...commonModules]
})
export class SharedModule {
}
