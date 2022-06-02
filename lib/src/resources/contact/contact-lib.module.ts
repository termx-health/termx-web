import {NgModule} from '@angular/core';
import {MarinaUiModule} from '@kodality-health/marina-ui';
import {CorePipesModule} from '@kodality-web/core-util';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ContactListComponent} from './containers/contact-list.component';
import {TranslateModule} from '@ngx-translate/core';


@NgModule({
  imports: [
    MarinaUiModule,
    CorePipesModule,
    FormsModule,
    CommonModule,
    TranslateModule
  ],
  declarations: [
    ContactListComponent
  ],
  exports: [
    ContactListComponent
  ]
})
export class ContactLibModule {
}
