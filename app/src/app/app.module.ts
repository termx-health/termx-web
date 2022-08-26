import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {environment} from '../environments/environment';
import {TERMINOLOGY_API} from 'terminology-lib/terminology-lib.token';
import {MarinaUiModule, MUI_CONFIG, MuiConfig, MuiHttpErrorHandler} from '@kodality-health/marina-ui';
import {CoreI18nService, CoreI18nTranslationHandler, CoreUtilModule, TRANSLATION_HANDLER} from '@kodality-web/core-util';
import {registerLocaleData} from '@angular/common';
import et from '@angular/common/locales/et';
import {ResourcesModule} from './resources/resources.module';
import {MarinaUtilModule} from '@kodality-health/marina-util';
import {IntegrationModule} from './integration/integration.module';
import {ResourcesLibModule} from 'terminology-lib/resources';
import {FhirLibModule} from 'terminology-lib/fhir';
import {JobLibModule} from 'terminology-lib/job';
import {PrivilegesModule} from './privileges/privileges.module';
import {AuthLibModule} from 'terminology-lib/auth/auth-lib.module';
import {ToolsModule} from './tools/tools.module';
import {NoPrivilegeModule} from './core/no-privilege/no-privilege.module';
import {OauthConfigModule} from './auth/oauth-config.module';
import {SharedModule} from './core/shared/shared.module';
import {GlobalSearchModule} from './globalsearch/global-search.module';
import {MeasurementUnitLibModule} from 'terminology-lib/measurementunit';
import {MeasurementUnitModule} from './measurementunit/measurement-unit.module';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {OauthHttpInterceptor} from './auth/oauth-http-interceptor.service';
import {AuthService} from './auth/auth.service';
import {Observable} from 'rxjs';
import {YupiHttpInterceptor} from './auth/yupi-http-interceptor.service';

registerLocaleData(et);


export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, "./assets/i18n/");
}

export function TranslationHandlerFactory(translateService: TranslateService): CoreI18nTranslationHandler {
  return (key, params) => translateService.instant(key, params);
}

export function preloadAuth(authService: AuthService): () => Observable<any> {
  return () => authService.refresh();
}

export function MarinaUiConfigFactory(): MuiConfig {
  return {
    multiLanguageInput: {
      languages: [
        {code: 'en', names: {'en': 'English', 'et': 'Inglise'}},
        {code: 'et', names: {'en': 'Estonian', 'et': 'Eesti'}},
        {code: 'ru', names: {'en': 'Russian', 'et': 'Vene'}},
      ],
      requiredLanguages: ['en']
    },
    notifications: {
      top: '4em'
    },
    supportedLangs: {
      en: true
    }
  };
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

    MarinaUiModule,
    MarinaUtilModule,
    ResourcesLibModule,
    ResourcesModule,
    FhirLibModule,
    IntegrationModule,
    JobLibModule,
    PrivilegesModule,
    AuthLibModule,
    GlobalSearchModule,

    ToolsModule,
    NoPrivilegeModule,
    OauthConfigModule,
    CoreUtilModule,
    SharedModule,

    MeasurementUnitLibModule,
    MeasurementUnitModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'en'},
    {provide: TERMINOLOGY_API, useValue: environment.terminologyApi},
    {provide: TRANSLATION_HANDLER, useFactory: TranslationHandlerFactory, deps: [TranslateService]},
    {provide: HTTP_INTERCEPTORS, useClass: YupiHttpInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: OauthHttpInterceptor, multi: true, deps: [OidcSecurityService]},
    {provide: HTTP_INTERCEPTORS, useClass: MuiHttpErrorHandler, multi: true},
    {provide: MUI_CONFIG, useFactory: MarinaUiConfigFactory},
    {provide: APP_INITIALIZER, useFactory: preloadAuth, deps: [AuthService], multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  public constructor(translateService: TranslateService, i18nService: CoreI18nService) {
    translateService.use('en');
    translateService.onLangChange.subscribe(({lang}) => i18nService.use(lang));
  }
}
