import {NgModule} from '@angular/core';
import {AbstractSecurityStorage, AuthModule, OpenIdConfiguration, StsConfigLoader, StsConfigStaticLoader} from 'angular-auth-oidc-client';
import {OauthStorageService} from './oauth-storage.service';
import {OIDC_CONFIG} from '../../terminology-lib.config';


@NgModule({
  imports: [
    AuthModule.forRoot({
      loader: {
        provide: StsConfigLoader,
        useFactory: (config: OpenIdConfiguration) => new StsConfigStaticLoader(config),
        deps: [OIDC_CONFIG],
      },
    })
  ],
  providers: [
    {
      provide: AbstractSecurityStorage,
      useClass: OauthStorageService
    }
  ],
  exports: [AuthModule],
})
export class OauthConfigModule {
}
