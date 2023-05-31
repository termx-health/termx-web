import {NgModule} from '@angular/core';
import {ContactListComponent} from './containers/contact-list.component';
import {CoreUiModule} from '../../core/ui/core-ui.module';
import {ResourcesLibModule} from 'term-web/resources/_lib';


@NgModule({
  imports: [
    CoreUiModule,
    ResourcesLibModule
  ],
  declarations: [
    ContactListComponent
  ],
  exports: [
    ContactListComponent
  ]
})
export class ContactModule {
}
