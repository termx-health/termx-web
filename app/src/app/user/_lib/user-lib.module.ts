import {NgModule} from '@angular/core';
import {UserLibService} from './services/user-lib.service';
import {UserSelectComponent} from 'term-web/user/_lib/components/user-select.component';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {CommonModule} from '@angular/common';
import {MarinaUiModule} from '@kodality-web/marina-ui';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    MarinaUiModule,
    CoreUiModule,
    FormsModule
  ],
  providers: [UserLibService],
  declarations: [
    UserSelectComponent
  ],
  exports: [
    UserSelectComponent
  ]
})
export class UserLibModule {
}
