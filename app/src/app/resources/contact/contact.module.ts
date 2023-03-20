import {NgModule} from '@angular/core';
import {ContactListComponent} from './containers/contact-list.component';
import {SharedModule} from '../../core/shared/shared.module';
import {ResourcesLibModule} from '@terminology/core';


@NgModule({
  imports: [
    SharedModule,
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
