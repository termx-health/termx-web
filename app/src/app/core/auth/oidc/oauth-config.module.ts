import {NgModule} from '@angular/core';
import {AbstractSecurityStorage, AuthModule, LogLevel} from 'angular-auth-oidc-client';
import {OauthStorageService} from './oauth-storage.service';
import {environment} from 'environments/environment';


@NgModule({
  imports: [
    AuthModule.forRoot({
      config: {
        configId: 'termx-client',
        authority: environment.oauthIssuer,
        redirectUrl: window.location.origin + environment.baseHref,
        postLogoutRedirectUri: window.location.origin + environment.baseHref,
        clientId: environment.oauthClientId,
        scope: 'openid profile offline_access',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        renewTimeBeforeTokenExpiresInSeconds: 30 ,
        ignoreNonceAfterRefresh: true,
        logLevel: LogLevel.Debug
      }
    })
  ],
  providers: [{
    provide: AbstractSecurityStorage,
    useClass: OauthStorageService
  }],
  exports: [AuthModule],
})
export class OauthConfigModule {
}
