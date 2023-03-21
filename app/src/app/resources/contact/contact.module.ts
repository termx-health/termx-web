import {NgModule} from '@angular/core';
import {ContactListComponent} from './containers/contact-list.component';
import {SharedModule} from '../../core/shared/shared.module';
import {ResourcesLibModule} from 'term-web/resources/_lib';


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
