import {ModuleWithProviders, NgModule} from '@angular/core';
import {MarinaUiModule, MUI_CONFIG, MuiConfig, MuiConfigService, MuiHttpErrorHandler} from '@kodality-web/marina-ui';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {CoreI18nService, CoreI18nTranslationHandler, TRANSLATION_HANDLER} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';

export function TranslationHandlerFactory(translateService: TranslateService): CoreI18nTranslationHandler {
  return (key, params) => translateService.instant(key, params);
}

export function MarinaUiConfigFactory(external: MuiConfig): MuiConfig {
  return {
    table:{
      showPageSizeChanger: true,
      pageSizeOptions: [10, 20, 50, 100]
    },
    multiLanguageInput: {
      languages: [
        {code: 'en', names: {'en': 'English', 'et': 'Inglise', 'ru': 'Английский', 'lt': 'Anglų'}},
        {code: 'et', names: {'en': 'Estonian', 'et': 'Eesti', 'ru': 'Эстонский', 'lt': 'Estų'}},
        {code: 'ru', names: {'en': 'Russian', 'et': 'Vene', 'ru': 'Русский', 'lt': 'Rusų'}},
        {code: 'lt', names: {'en': 'Lithuanian', 'et': 'Leedu', 'ru': 'Литовский', 'lt': 'Lietuvių'}},
      ],
      requiredLanguages: ['en']
    },
    notifications: {
      top: '4em'
    },
    supportedLangs: {
      en: {label: 'EN English'},
      et: {label: 'ET Eesti'},
      lt: {label: 'LT Lietuvių'}
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
  public constructor(translate: TranslateService, muiTranslate: CoreI18nService, muiConfig: MuiConfigService) {
    translate.onLangChange.subscribe(({lang}) => {
      muiTranslate.use(lang);
      muiConfig.set('multiLanguageInput', {
        ...muiConfig.getConfigFor('multiLanguageInput'), requiredLanguages: [lang]
      });
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
