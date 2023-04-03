import {NgModule} from '@angular/core';
import {NoPrivilegeComponent} from './no-privilege.component';
import {SharedModule} from 'term-web/core/shared/shared.module';

@NgModule({
  imports: [
    SharedModule
  ],
  exports: [
    NoPrivilegeComponent
  ],
  declarations: [
    NoPrivilegeComponent
  ]
})
export class NoPrivilegeModule {
}
