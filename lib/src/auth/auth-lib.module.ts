import {NgModule} from '@angular/core';
import {PrivilegeLibModule} from './privileges';
import {AuthLibService} from './auth/services/auth-lib.service';

@NgModule({
  declarations: [],
  imports: [
    PrivilegeLibModule
  ],
  exports: [
    PrivilegeLibModule
  ],
  providers: [
    AuthLibService
  ]
})
export class AuthLibModule {
}


