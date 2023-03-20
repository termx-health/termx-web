import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {HttpBackend, HttpClientModule} from '@angular/common/http';
import {environment} from '../environments/environment';
import {
  AuthModule,
  AuthService,
  FhirLibModule,
  JobLibModule,
  MarinaUiConfigModule,
  MeasurementUnitLibModule,
  ProjectLibModule,
  ResourcesLibModule,
  TERMINOLOGY_API_URL,
  TERMINOLOGY_CHEF_URL
} from '@terminology/core';
import {CoreUtilModule} from '@kodality-web/core-util';
import {registerLocaleData} from '@angular/common';
import et from '@angular/common/locales/et';
import {ResourcesModule} from './resources/resources.module';
import {MarinaUtilModule} from '@kodality-web/marina-util';
import {NoPrivilegeModule} from './core/no-privilege/no-privilege.module';
import {SharedModule} from './core/shared/shared.module';
import {Observable} from 'rxjs';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import {PrivilegesModule} from './privileges/privileges.module';
import {IntegrationModule} from './integration/integration.module';
import {GlobalSearchModule} from './globalsearch/global-search.module';
import {ThesaurusModule} from './thesaurus/thesaurus.module';
import {FhirModule} from './fhir/fhir.module';
import {ToolsModule} from './tools/tools.module';
import {MeasurementUnitModule} from './measurementunit/measurement-unit.module';
import {ProjectModule} from './project/project.module';

registerLocaleData(et);


export function HttpLoaderFactory(http: HttpBackend): TranslateLoader {
  return new MultiTranslateHttpLoader(http, ['/assets/i18n/', '/assets/termsupp/i18n/']);
}


export function preloadAuth(authService: AuthService): () => Observable<any> {
  return () => authService.refresh();
}

const TERM_MODULES = [
  ResourcesLibModule,
  ResourcesModule,
  FhirLibModule,
  IntegrationModule,
  JobLibModule,
  PrivilegesModule,
  GlobalSearchModule,
  ThesaurusModule,
  FhirModule,

  ToolsModule,

  MeasurementUnitLibModule,
  MeasurementUnitModule,

  ProjectLibModule,
  ProjectModule
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpBackend]
      }
    }),

    MarinaUiConfigModule.forRoot(),
    MarinaUtilModule,
    CoreUtilModule,

    AuthModule.forRoot({
      context: {
        production: environment.production,
        yupiEnabled: environment.yupiEnabled
      },
      oidc: {
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
        logLevel: 2
      }
    }),

    SharedModule,
    NoPrivilegeModule,

    ...TERM_MODULES
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'en'},
    {provide: TERMINOLOGY_API_URL, useValue: environment.terminologyApi},
    {provide: TERMINOLOGY_CHEF_URL, useValue: environment.chefUrl},
    {provide: APP_INITIALIZER, useFactory: preloadAuth, deps: [AuthService], multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  public constructor(translate: TranslateService) {
    translate.use('en');
  }
}
