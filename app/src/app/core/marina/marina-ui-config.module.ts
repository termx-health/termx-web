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
        {code: 'en', names: {'en': 'English', 'et': 'Inglise', 'ru': 'Английский', 'lt': 'Anglų', 'de': 'Englisch', 'fr': 'Anglais', 'nl': 'Engels'}},
        {code: 'et', names: {'en': 'Estonian', 'et': 'Eesti', 'ru': 'Эстонский', 'lt': 'Estų', 'de': 'Estnisch', 'fr': 'Estonien', 'nl': 'Ests'}},
        {code: 'ru', names: {'en': 'Russian', 'et': 'Vene', 'ru': 'Русский', 'lt': 'Rusų', 'de': 'Russisch', 'fr': 'Russe', 'nl': 'Russisch'}},
        {code: 'lt', names: {'en': 'Lithuanian', 'et': 'Leedu', 'ru': 'Литовский', 'lt': 'Lietuvių', 'de': 'Litauisch', 'fr': 'Lituanien', 'nl': 'Litouws'}},
        {code: 'de', names: {'en': 'German', 'et': 'Saksa', 'ru': 'Немецкий', 'de': 'Deutsch', 'fr': 'Allemand', 'nl': 'Duits'}},
        {code: 'fr', names: {'en': 'French', 'et': 'Prantsuse', 'ru': 'Французский', 'de': 'Französisch', 'fr': 'Français', 'nl': 'Frans'}},
        {code: 'nl', names: {'en': 'Dutch', 'et': 'Hollandi', 'ru': 'Голландский', 'de': 'Niederländisch', 'fr': 'Néerlandais', 'nl': 'Nederlands'}},
      ],
      requiredLanguages: ['en']
    },
    notifications: {
      top: '4em'
    },
    supportedLangs: {
      en: {label: 'EN English'},
      et: {label: 'ET Eesti'},
      lt: {label: 'LT Lietuvių'},
      de: {label: 'DE Deutsch'},
      fr: {label: 'FR Français'},
      nl: {label: 'NL Nederlands'},      
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
