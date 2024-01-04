import {ModuleWithProviders, NgModule} from '@angular/core';
import {MarinaUiModule, MUI_CONFIG, MuiConfig, MuiConfigService, MuiHttpErrorHandler} from '@kodality-web/marina-ui';
import {HTTP_INTERCEPTORS, HttpBackend, HttpClient} from '@angular/common/http';
import {CoreI18nService, CoreI18nTranslationHandler, group, isDefined, TRANSLATION_HANDLER} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {MarinaMarkdownModule} from '@kodality-web/marina-markdown';
import {environment as env} from 'environments/environment';
import {registerLocaleData} from '@angular/common';

export function TranslationHandlerFactory(translateService: TranslateService): CoreI18nTranslationHandler {
  return (key, params) => translateService.instant(key, params);
}

export function MarinaUiConfigFactory(external: MuiConfig): MuiConfig {
  return {
    notifications: {
      top: '4em'
    },
    table: {
      showPageSizeChanger: true,
      pageSizeOptions: [10, 20, 50, 100]
    },
    multiLanguageInput: {
      languages: [],
      requiredLanguages: [env.defaultLanguage]
    },
    systemLanguages: {},
    ...external
  };
}


@NgModule({
  imports: [
    MarinaUiModule,
    MarinaMarkdownModule.configure({
      plantUml: {server: env.plantUmlUrl}
    }),
  ],
  exports: [
    MarinaUiModule
  ]
})
export class MarinaUiConfigModule {
  public constructor(
    http: HttpBackend,
    translate: TranslateService,
    i18nService: CoreI18nService,
    muiConfig: MuiConfigService
  ) {
    translate.onLangChange.subscribe(({lang}) => {
      import(/* webpackInclude: /\/\w\w.mjs$/ */ `node_modules/@angular/common/locales/${lang}.mjs`)
        .then(locale => registerLocaleData(locale.default))
        .then(() => {
          i18nService.use(lang);

          // 'lang' translations in other locales
          const translations = translate.store.translations?.[lang]?.['language'];
          // update content languages in multi language input
          muiConfig.set('multiLanguageInput', {
            requiredLanguages: [env.defaultLanguage],
            languages: env.contentLanguages.map(k => ({
              code: k,
              names: {[lang]: translations[k] ?? k}
            }))
          });
        });
    });


    new HttpClient(http).get('/assets/ui-languages.json').subscribe(uiLangs => {
      muiConfig.set('systemLanguages',
        group(env.uiLanguages.filter(k => uiLangs[k]), k => k, k => ({label: [k.toUpperCase(), uiLangs[k]].filter(isDefined).join(' ')})));
    });
  }

  public static init(marinaConfig: MuiConfig = {}): ModuleWithProviders<MarinaUiConfigModule> {
    return {
      ngModule: MarinaUiConfigModule,
      providers: [
        {provide: MUI_CONFIG, useFactory: () => MarinaUiConfigFactory(marinaConfig)},
        {provide: TRANSLATION_HANDLER, useFactory: TranslationHandlerFactory, deps: [TranslateService]},
        {provide: HTTP_INTERCEPTORS, useClass: MuiHttpErrorHandler, multi: true},
      ]
    };
  }
}
