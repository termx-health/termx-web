import {dynamicEnv} from './dynamic-env';

export const environment = {
  production: true,
  yupiEnabled: false,
  termxApi: '/api',
  oauthIssuer: dynamicEnv.oauthIssuer,
  oauthClientId: dynamicEnv.oauthClientId,
  swaggerUrl: '/swagger/',
  chefUrl: '/chef',
  plantUmlUrl: '/plantuml'
};
