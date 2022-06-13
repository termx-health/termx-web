import {NgModule} from '@angular/core';
import {ContactListComponent} from './containers/contact-list.component';
import {SharedModule} from '../../core/shared/shared.module';
import {CodeSystemLibModule, ValueSetLibModule} from 'terminology-lib/resources';


@NgModule({
  imports: [
    SharedModule,
    CodeSystemLibModule,
    ValueSetLibModule
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
