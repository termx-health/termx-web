import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {HasAllPrivilegesPipe} from 'term-web/core/auth/privileges/has-all-privileges.pipe';
import {PrivilegeContextDirective} from 'term-web/core/auth/privileges/privilege-context.directive';
import {PrivilegedDirective} from 'term-web/core/auth/privileges/privileged.directive';
import {PrivilegedPipe} from 'term-web/core/auth/privileges/privileged.pipe';
import {OauthConfigModule, OauthHttpInterceptor} from './oidc';
import {HasAnyPrivilegePipe} from './privileges/has-any-privilege.pipe';
import {YupiHttpInterceptor} from './yupi/yupi.http-interceptor';


@NgModule({
  imports: [
    OauthConfigModule,
  ],
  declarations: [
    PrivilegedDirective,
    PrivilegeContextDirective,
    HasAnyPrivilegePipe,
    HasAllPrivilegesPipe,
    PrivilegedPipe,
  ],
  exports: [
    OauthConfigModule,
    PrivilegedDirective,
    PrivilegeContextDirective,
    HasAnyPrivilegePipe,
    HasAllPrivilegesPipe,
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
