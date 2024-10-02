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

  termxApi: 'https://demo.termx.org/api',
  // termxApi: 'http://localhost:8200',

  oauthIssuer: 'https://auth.termx.org/realms/termx',
  oauthClientId: 'term-client',
  oauthScope: 'openid profile offline_access',

  swaggerUrl: 'https://demo.termx.org/swagger/',
  chefUrl: 'https://demo.termx.org/chef',
  plantUmlUrl: 'https://demo.termx.org/plantuml',
  fmlEditor: 'https://demo.termx.org/fml-editor',

  snowstormUrl: 'https://snowstorm.termx.org/',
  snomedBrowserUrl: 'https://snomed.termx.org/',
  snowstormDailyBuildUrl: 'https://snowstorm-dailybuild.termx.org/',
  snomedBrowserDailyBuildUrl: 'https://snomed-dailybuild.termx.org/',
};
