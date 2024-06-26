import {Environment, UI_LANGS} from './environment.base';


export const environment: Environment = {
  appVersion: require('../../../package.json').version,
  production: false,
  yupiEnabled: false,
  baseHref: '/',

  defaultLanguage: 'en',
  uiLanguages: [...UI_LANGS],
  contentLanguages: [...UI_LANGS],
  extraLanguages: {},

  termxApi: 'https://termx.kodality.dev/api',
  // termxApi: 'http://localhost:8200',

  oauthIssuer: 'https://auth.kodality.dev/realms/terminology',
  oauthClientId: 'term-client',
  oauthScope: 'openid profile offline_access',

  swaggerUrl: 'https://termx.kodality.dev/swagger/',
  chefUrl: 'https://termx.kodality.dev/chef',
  plantUmlUrl: 'https://termx.kodality.dev/plantuml',
  fmlEditor: 'https://termx.kodality.dev/fml-editor',

  snowstormUrl: 'https://snowstorm-public.kodality.dev/',
  snowstormDailyBuildUrl: 'https://snowstorm-public-dailybuild.kodality.dev/',
};
