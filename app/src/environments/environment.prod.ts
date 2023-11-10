import {dynamicEnv} from './dynamic-env';
import {Environment, UI_LANGS} from './environment.base';


export const environment: Environment = {
  appVersion: require('../../../package.json').version,
  production: true,
  yupiEnabled: false,
  defaultLanguage: dynamicEnv.defaultLanguage || 'en',
  uiLanguages: dynamicEnv.uiLanguages || UI_LANGS,
  contentLanguages: dynamicEnv.contentLanguages || dynamicEnv.uiLanguages || UI_LANGS,
  extraLanguages: dynamicEnv.extraLanguages || {},
  termxApi: dynamicEnv.termxApi || '/api',
  oauthIssuer: dynamicEnv.oauthIssuer,
  oauthClientId: dynamicEnv.oauthClientId,
  swaggerUrl: dynamicEnv.swaggerUrl || '/swagger/',
  chefUrl: dynamicEnv.chefUrl || '/chef',
  plantUmlUrl: dynamicEnv.plantUmlUrl || '/plantuml',
  fmlEditor: dynamicEnv.fmlEditor || '/fml-editor',
  snowstormUrl: dynamicEnv.snowstormUrl || 'https://snowstorm-public.kodality.dev/',
  snowstormDailyBuildUrl: dynamicEnv.snowstormDailyBuildUrl || 'https://snowstorm-public-dailybuild.kodality.dev/',
};
