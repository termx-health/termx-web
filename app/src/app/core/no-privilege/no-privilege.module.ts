import {NgModule} from '@angular/core';
import {NoPrivilegeComponent} from './components/no-privilege.component';
import {SharedModule} from '../shared/shared.module';

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