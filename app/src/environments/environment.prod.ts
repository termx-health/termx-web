import {dynamicEnv} from './dynamic-env';

export const environment = {
  appVersion: require('../../../package.json').version,
  production: true,
  yupiEnabled: false,
  termxApi: dynamicEnv.termxApi || '/api',
  oauthIssuer: dynamicEnv.oauthIssuer,
  oauthClientId: dynamicEnv.oauthClientId,
  swaggerUrl: dynamicEnv.swaggerUrl || '/swagger/',
  chefUrl: dynamicEnv.chefUrl || '/chef',
  plantUmlUrl: dynamicEnv.plantUmlUrl || '/plantuml',
  fmlEditor: dynamicEnv.fmlEditor || '/fml-editor',
  snowstormUrl: dynamicEnv.snowstormUrl || 'https://snowstorm-public.kodality.dev/',
  snowstormDailyBuildUrl: dynamicEnv.snowstormDailyBuildUrl || 'https://snowstorm-public-dailybuild.kodality.dev/'
};
