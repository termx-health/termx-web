import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TerminologyLibModule} from 'terminology-lib/terminology-lib.module';
import {environment} from '../environments/environment';
import {TERMINOLOGY_API} from 'terminology-lib/terminology-lib.token';
import {MarinaUiModule, MULTI_LANGUAGE_INPUT_LANGS, MULTI_LANGUAGE_INPUT_REQUIRED_LANGS} from '@kodality-health/marina-ui';
import {CoreI18nService, CoreI18nTranslationHandler, TRANSLATION_HANDLER} from '@kodality-web/core-util';
import {registerLocaleData} from '@angular/common';
import et from '@angular/common/locales/et';


registerLocaleData(et);

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function TranslationHandlerFactory(translateService: TranslateService): CoreI18nTranslationHandler {
  return (key, params) => translateService.instant(key, params);
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
    TerminologyLibModule,
    MarinaUiModule
  ],
  providers: [
    {provide: TERMINOLOGY_API, useValue: environment.terminologyApi},
    {provide: LOCALE_ID, useValue: 'en'},
    {provide: TRANSLATION_HANDLER, useFactory: TranslationHandlerFactory, deps: [TranslateService]},
    {
      provide: MULTI_LANGUAGE_INPUT_LANGS, useValue: [
        {code: 'en', names: {'en': 'English', 'et': 'Inglise'}},
        {code: 'et', names: {'en': 'Estonian', 'et': 'Eesti'}},
        {code: 'ru', names: {'en': 'Russian', 'et': 'Vene'}},
      ]
    },
    {provide: MULTI_LANGUAGE_INPUT_REQUIRED_LANGS, useValue: ['en']}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  public constructor(translateService: TranslateService, i18nService: CoreI18nService) {
    translateService.use('en');
    translateService.onLangChange.subscribe(({lang}) => i18nService.use(lang));
  }
}
