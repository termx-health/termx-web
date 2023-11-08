import {dynamicEnv} from './dynamic-env';

const PROD_DEFAULT_LANGUAGE = {
  code: 'en',
  names: {
    'en': 'English',
    'et': 'Inglise',
    'lt': 'Anglų',
    'de': 'Englisch',
    'fr': 'Anglais',
    'nl': 'Engels'
  }
};


export const environment = {
  appVersion: require('../../../package.json').version,
  production: true,
  yupiEnabled: false,
  languages: (dynamicEnv.languages || [PROD_DEFAULT_LANGUAGE]) as typeof PROD_DEFAULT_LANGUAGE[],
  defaultLanguage: dynamicEnv.defaultLanguage || PROD_DEFAULT_LANGUAGE.code,
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
