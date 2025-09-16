import {dynamicEnv} from './dynamic-env';
import {Environment, UI_LANGS} from './environment.base';


export const environment: Environment = {
  appVersion: require('../../../package.json').version,
  production: true,
  yupiEnabled: false,
  baseHref: dynamicEnv.baseHref || '/',

  defaultLanguage: dynamicEnv.defaultLanguage || 'en',
  uiLanguages: dynamicEnv.uiLanguages || UI_LANGS,
  contentLanguages: dynamicEnv.contentLanguages || dynamicEnv.uiLanguages || UI_LANGS,
  extraLanguages: dynamicEnv.extraLanguages || {},

  oauthIssuer: dynamicEnv.oauthIssuer,
  oauthClientId: dynamicEnv.oauthClientId,
  oauthScope: dynamicEnv.oauthScope || 'openid profile offline_access',

  termxApi: dynamicEnv.termxApi || '/api',
  swaggerUrl: dynamicEnv.swaggerUrl || '/swagger/',
  chefUrl: dynamicEnv.chefUrl || '/chef',
  chefFhirVersion: dynamicEnv.chefFhirVersion || '5.0.0',
  plantUmlUrl: dynamicEnv.plantUmlUrl || '/plantuml',
  fmlEditor: dynamicEnv.fmlEditor || '/fml-editor',

  snowstormUrl: dynamicEnv.snowstormUrl,
  snomedBrowserUrl: dynamicEnv.snomedBrowserUrl,
  snowstormDailyBuildUrl: dynamicEnv.snowstormDailyBuildUrl,
  snomedBrowserDailyBuildUrl: dynamicEnv.snomedBrowserDailyBuildUrl,
};
