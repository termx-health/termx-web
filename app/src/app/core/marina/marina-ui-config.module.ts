import {ModuleWithProviders, NgModule} from '@angular/core';
import {MarinaUiModule, MUI_CONFIG, MuiConfig, MuiHttpErrorHandler} from '@kodality-web/marina-ui';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {CoreI18nService, CoreI18nTranslationHandler, TRANSLATION_HANDLER} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';

export function TranslationHandlerFactory(translateService: TranslateService): CoreI18nTranslationHandler {
  return (key, params) => translateService.instant(key, params);
}

export function MarinaUiConfigFactory(external: MuiConfig): MuiConfig {
  return {

    multiLanguageInput: {
      languages: [
        {code: 'en', names: {'en': 'English', 'et': 'Inglise', 'ru': 'Английский', 'uz-LATN': 'Ingliz', 'uz-CYRL': 'Инглиз'}},
        {code: 'et', names: {'en': 'Estonian', 'et': 'Eesti'}},
        {code: 'ru', names: {'en': 'Russian', 'et': 'Vene', 'ru': 'Русский', 'uz-LATN': 'Rus', 'uz-CYRL': 'Рус'}},
        {code: 'uz-CYRL', names: {'en': 'Uzbek cyrl', 'ru': 'Узбекский латиница', 'uz-LATN': 'Ўзбекча', 'uz-CYRL': 'Ўзбекча'}},
        {code: 'uz-LATN', names: {'en': 'Uzbek latn', 'ru': 'Узбекский кириллица', 'uz-LATN': 'Oʻzbekcha', 'uz-CYRL': 'Oʻzbekcha'}},
      ],
      requiredLanguages: ['en']
    },
    notifications: {
      top: '4em'
    },
    supportedLangs: {
      en: {label: 'EN English'},
      et: {label: 'ET Eesti'},
      lt: {label: 'LT'}
    },
    ...external
  };
}

@NgModule({
  imports: [
    MarinaUiModule
  ],
  exports: [
    MarinaUiModule
  ]
})
export class MarinaUiConfigModule {
  public constructor(translate: TranslateService, i18nService: CoreI18nService) {
    translate.onLangChange.subscribe(({lang}) => i18nService.use(lang));
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
