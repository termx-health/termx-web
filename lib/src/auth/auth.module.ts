import {ModuleWithProviders, NgModule} from '@angular/core';
import {PrivilegeDirective} from './privileges/privilege.directive';
import {OidcSecurityService, OpenIdConfiguration} from 'angular-auth-oidc-client';
import {OauthConfigModule, OauthHttpInterceptor} from './oidc';
import {HTTP_INTERCEPTORS, HttpInterceptor} from '@angular/common/http';
import {YupiHttpInterceptor} from './yupi/yupi.http-interceptor';
import {OIDC_CONFIG, TERMINOLOGY_LIB_CONTEXT, TerminologyLibContext} from '../terminology-lib.config';
import {HasAnyPrivilegePipe} from './privileges/has-any-privilege.pipe';

function YupiInterceptor(context: TerminologyLibContext): HttpInterceptor {
  return new YupiHttpInterceptor(context);
}

function OauthInterceptor(oidc: OidcSecurityService, context: TerminologyLibContext): HttpInterceptor {
  return new OauthHttpInterceptor(oidc, context);
}

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
  public static forRoot({context, oidc}: {context: TerminologyLibContext, oidc: OpenIdConfiguration}): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        {provide: TERMINOLOGY_LIB_CONTEXT, useValue: context},
        {provide: OIDC_CONFIG, useValue: oidc},
        {provide: HTTP_INTERCEPTORS, useFactory: YupiInterceptor, multi: true, deps: [TERMINOLOGY_LIB_CONTEXT]},
        {provide: HTTP_INTERCEPTORS, useFactory: OauthInterceptor, multi: true, deps: [OidcSecurityService, TERMINOLOGY_LIB_CONTEXT]}
      ]
    };
  }

  public static forChild(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule
    };
  }
}
