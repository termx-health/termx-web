import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {environment} from '../environments/environment';
import {TERMINOLOGY_API} from 'terminology-lib/terminology-lib.token';
import {MarinaUiModule, MUI_CONFIG, MuiConfig, MuiHttpErrorHandler, MuiOauthHttpInterceptor} from '@kodality-health/marina-ui';
import {CoreI18nService, CoreI18nTranslationHandler, TRANSLATION_HANDLER} from '@kodality-web/core-util';
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


registerLocaleData(et);


export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, "./assets/i18n/");
}

export function TranslationHandlerFactory(translateService: TranslateService): CoreI18nTranslationHandler {
  return (key, params) => translateService.instant(key, params);
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
    },
    users: [
      {
        name: "Viewer",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcml2aWxlZ2VzIjpbImtvZGFsaXR5LmNvZGUtc3lzdGVtLnZpZXciLCJrb2RhbGl0eS52YWx1ZS1zZXQudmlldyIsImtvZGFsaXR5Lm1hcC1zZXQudmlldyIsImtvZGFsaXR5Lm5hbWluZy1zeXN0ZW0udmlldyJdfQ.igl1qqS2SCV9ODjFj3nyepwcPHS_iXXB4MVgs8bsmj8"
      },
      {
        name: "Editor",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcml2aWxlZ2VzIjpbImtvZGFsaXR5LmNvZGUtc3lzdGVtLnZpZXciLCJrb2RhbGl0eS5jb2RlLXN5c3RlbS5lZGl0Iiwia29kYWxpdHkudmFsdWUtc2V0LnZpZXciLCJrb2RhbGl0eS52YWx1ZS1zZXQuZWRpdCIsImtvZGFsaXR5Lm1hcC1zZXQudmlldyIsImtvZGFsaXR5Lm1hcC1zZXQuZWRpdCIsImtvZGFsaXR5Lm5hbWluZy1zeXN0ZW0udmlldyIsImtvZGFsaXR5Lm5hbWluZy1zeXN0ZW0uZWRpdCJdfQ.8aOAQzBZeZjf2v2Lo0ubjVCH2L9X1lFygA6SUH7w8Uk"
      },
      {
        name: "Publisher",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcml2aWxlZ2VzIjpbImtvZGFsaXR5LmNvZGUtc3lzdGVtLnZpZXciLCJrb2RhbGl0eS5jb2RlLXN5c3RlbS5wdWJsaXNoIiwia29kYWxpdHkudmFsdWUtc2V0LnZpZXciLCJrb2RhbGl0eS52YWx1ZS1zZXQucHVibGlzaCIsImtvZGFsaXR5Lm1hcC1zZXQudmlldyIsImtvZGFsaXR5Lm1hcC1zZXQucHVibGlzaCIsImtvZGFsaXR5Lm5hbWluZy1zeXN0ZW0udmlldyIsImtvZGFsaXR5Lm5hbWluZy1zeXN0ZW0ucHVibGlzaCJdfQ.z8HnmAyCEwQ0pkrQ1O2wnoCUwJxyP5Mbrptj3jctM08"
      },
      {name: "Admin", accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcml2aWxlZ2VzIjpbImFkbWluIl19.ByZ0vl71zfIXtpt-PkPTi3icPAaupqoo746jnP3cDkQ"}
    ]
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

    ToolsModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'en'},
    {provide: TERMINOLOGY_API, useValue: environment.terminologyApi},
    {provide: TRANSLATION_HANDLER, useFactory: TranslationHandlerFactory, deps: [TranslateService]},
    {provide: HTTP_INTERCEPTORS, useClass: MuiOauthHttpInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: MuiHttpErrorHandler, multi: true},
    {provide: MUI_CONFIG, useFactory: MarinaUiConfigFactory}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  public constructor(translateService: TranslateService, i18nService: CoreI18nService) {
    translateService.use('en');
    translateService.onLangChange.subscribe(({lang}) => i18nService.use(lang));
  }
}
