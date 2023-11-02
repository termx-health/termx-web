import {dynamicEnv} from './dynamic-env';

export const environment = {
  appVersion: require('../../../package.json').version,
  production: true,
  yupiEnabled: false,
  termxApi: dynamicEnv.termxApi ?? '/api',
  oauthIssuer: dynamicEnv.oauthIssuer,
  oauthClientId: dynamicEnv.oauthClientId,
  swaggerUrl: '/swagger/',
  chefUrl: '/chef',
  plantUmlUrl: '/plantuml',
  fmlEditor: '/fml-editor',
  snowstormUrl: 'https://snowstorm-public.kodality.dev/',
  snowstormDailyBuildUrl: 'https://snowstorm-public-dailybuild.kodality.dev/'
};
