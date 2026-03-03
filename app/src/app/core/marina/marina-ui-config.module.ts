import {registerLocaleData} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpBackend, HttpClient} from '@angular/common/http';
import { ModuleWithProviders, NgModule, inject } from '@angular/core';
import {CoreI18nService, CoreI18nTranslationHandler, group, isDefined, TRANSLATION_HANDLER} from '@kodality-web/core-util';
import {MarinaMarkdownModule} from '@kodality-web/marina-markdown';
import {MarinaUiModule, MUI_CONFIG, MuiConfig, MuiConfigService} from '@kodality-web/marina-ui';
import {TranslateService} from '@ngx-translate/core';
import {environment as env} from 'environments/environment';
import {HttpErrorHandler} from 'term-web/core/marina/http-error-handler';

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
  public constructor() {
    const http = inject(HttpBackend);
    const translate = inject(TranslateService);
    const i18nService = inject(CoreI18nService);
    const muiConfig = inject(MuiConfigService);

    translate.onLangChange.subscribe(({lang}) => {
      const localeImports: Record<string, () => Promise<any>> = {
        de: () => import('@angular/common/locales/de'),
        en: () => import('@angular/common/locales/en'),
        et: () => import('@angular/common/locales/et'),
        fr: () => import('@angular/common/locales/fr'),
        lt: () => import('@angular/common/locales/lt'),
        nl: () => import('@angular/common/locales/nl'),
      };
      (localeImports[lang]?.() ?? Promise.reject(`No locale data for '${lang}'`))
        .then(locale => registerLocaleData(locale.default))
        .catch(e => console.warn(`Failed to register locale data for '${lang}'`, e));
      i18nService.use(lang);

      // 'lang' translations in other locales
      const translations = (translate as any).store?.translations?.[lang]?.['language'];
      // update content languages in multi language input
      muiConfig.set('multiLanguageInput', {
        requiredLanguages: [env.defaultLanguage],
        languages: env.contentLanguages.map(k => ({
          code: k,
          names: {[lang]: translations[k] ?? k}
        }))
      });
    });


    new HttpClient(http).get('./assets/ui-languages.json').subscribe(uiLangs => {
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
        {provide: HTTP_INTERCEPTORS, useClass: HttpErrorHandler, multi: true},
      ]
    };
  }
}
