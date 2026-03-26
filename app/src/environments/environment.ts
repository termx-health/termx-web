import {Environment, UI_LANGS} from './environment.base';
import packageJson from '../../../package.json';


export const environment: Environment = {
  appVersion: packageJson.version,
  production: false,
  yupiEnabled: true,
  embedded: false,
  baseHref: '/',

  defaultLanguage: 'en',
  uiLanguages: [...UI_LANGS],
  contentLanguages: [...UI_LANGS],
  extraLanguages: {},

  //termxApi: 'https://demo.termx.org/api',
  termxApi: 'http://localhost:8200',

  oauthIssuer: 'https://auth.termx.org/realms/termx',
  oauthClientId: 'term-client',
  oauthScope: 'openid profile offline_access',

  // For local keycloak
  // oauthIssuer: 'http://localhost:8080/realms/termx',
  // oauthClientId: 'termx-client',


  swaggerUrl: 'https://demo.termx.org/swagger/',
  chefUrl: 'https://demo.termx.org/chef',
  chefFhirVersion: '5.0.0',
  plantUmlUrl: 'https://demo.termx.org/plantuml',
  fmlEditor: 'https://demo.termx.org/fml-editor',

  snowstormUrl: 'https://snowstorm.termx.org/',
  snomedBrowserUrl: 'https://snomed.termx.org/',
  snowstormDailyBuildUrl: 'https://snowstorm-dailybuild.termx.org/',
  snomedBrowserDailyBuildUrl: 'https://snomed-dailybuild.termx.org/',
};
