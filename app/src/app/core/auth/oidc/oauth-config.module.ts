import {NgModule} from '@angular/core';
import {AbstractSecurityStorage, AuthModule, LogLevel} from 'angular-auth-oidc-client';
import {OauthStorageService} from './oauth-storage.service';
import {environment} from 'environments/environment';


@NgModule({
  imports: [
    AuthModule.forRoot({
      config: {
        authority: environment.oauthIssuer,
        redirectUrl: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        clientId: environment.oauthClientId,
        scope: 'openid profile offline_access',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        renewTimeBeforeTokenExpiresInSeconds: 30,
        ignoreNonceAfterRefresh: true,
        logLevel: LogLevel.Warn
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
