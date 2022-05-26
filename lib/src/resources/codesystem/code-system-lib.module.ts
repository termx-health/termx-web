import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CodeSystemLibService} from './services/code-system-lib.service';
import {CodeSystemSearchComponent} from './containers/code-system-search.component';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {FormsModule} from '@angular/forms';
import {CoreUtilModule} from '@kodality-web/core-util';


@NgModule({
  imports: [
    CommonModule,
    MarinaUiModule,
    FormsModule,
    CoreUtilModule
  ],
  providers: [
    CodeSystemLibService
  ],
  declarations: [
    CodeSystemSearchComponent
  ],
  exports: [
    CodeSystemSearchComponent
  ]
})
export class CodeSystemLibModule {
}
