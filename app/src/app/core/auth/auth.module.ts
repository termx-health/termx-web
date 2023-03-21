import {ModuleWithProviders, NgModule} from '@angular/core';
import {PrivilegeDirective} from './privileges/privilege.directive';
import {OauthConfigModule, OauthHttpInterceptor} from './oidc';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {YupiHttpInterceptor} from './yupi/yupi.http-interceptor';
import {HasAnyPrivilegePipe} from './privileges/has-any-privilege.pipe';


@NgModule({
  imports: [
    OauthConfigModule,
  ],
  declarations: [
    PrivilegeDirective,
    HasAnyPrivilegePipe
  ],
  exports: [
    OauthConfigModule,
    PrivilegeDirective,
    HasAnyPrivilegePipe,
  ]
})
export class AuthModule {
  public static init(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        {provide: HTTP_INTERCEPTORS, useClass: YupiHttpInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: OauthHttpInterceptor, multi: true}
      ]
    };
  }
}
