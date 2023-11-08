import {ModuleWithProviders, NgModule} from '@angular/core';
import {MarinaUiModule, MUI_CONFIG, MuiConfig, MuiHttpErrorHandler} from '@kodality-web/marina-ui';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {CoreI18nService, CoreI18nTranslationHandler, group, TRANSLATION_HANDLER} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {MarinaMarkdownModule} from '@kodality-web/marina-markdown';
import {environment} from 'environments/environment';
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
      languages: environment.languages.map(l => ({code: l.code, names: l.names})),
      requiredLanguages: [environment.defaultLanguage]
    },
    systemLanguages: group(environment.languages, l => l.code, l => ({label: `${l.code.toUpperCase()} ${l.names[l.code]}`})),
    ...external
  };
}

@NgModule({
  imports: [
    MarinaUiModule,
    MarinaMarkdownModule.configure({
      plantUml: {server: environment.plantUmlUrl}
    }),
  ],
  exports: [
    MarinaUiModule
  ]
})
export class MarinaUiConfigModule {
  public constructor(translate: TranslateService, i18nService: CoreI18nService) {
    translate.onLangChange.subscribe(({lang}) => {
      import(/* webpackInclude: /\/\w\w.mjs$/ */ `../../../../../node_modules/@angular/common/locales/${lang}.mjs`)
        .then(locale => registerLocaleData(locale.default))
        .then(() => i18nService.use(lang))
        .catch(() => i18nService.use(lang));
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
