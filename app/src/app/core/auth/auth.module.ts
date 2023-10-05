import {ModuleWithProviders, NgModule} from '@angular/core';
import {OauthConfigModule, OauthHttpInterceptor} from './oidc';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {YupiHttpInterceptor} from './yupi/yupi.http-interceptor';
import {HasAnyPrivilegePipe} from './privileges/has-any-privilege.pipe';
import {PrivilegeContextDirective} from 'term-web/core/auth/privileges/privilege-context.directive';
import {PrivilegedDirective} from 'term-web/core/auth/privileges/privileged.directive';
import {PrivilegedPipe} from 'term-web/core/auth/privileges/privileged.pipe';


@NgModule({
  imports: [
    OauthConfigModule,
  ],
  declarations: [
    PrivilegedDirective,
    PrivilegeContextDirective,
    HasAnyPrivilegePipe,
    PrivilegedPipe,
  ],
  exports: [
    OauthConfigModule,
    PrivilegedDirective,
    PrivilegeContextDirective,
    HasAnyPrivilegePipe,
    PrivilegedPipe
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
