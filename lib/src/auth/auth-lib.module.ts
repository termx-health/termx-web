import {NgModule} from '@angular/core';
import {PrivilegeLibModule} from './privileges';

@NgModule({
  imports: [
    PrivilegeLibModule
  ],
  exports: [
    PrivilegeLibModule
  ]
})
export class AuthLibModule {
}


