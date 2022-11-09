import {dynamicEnv} from './dynamic-env';

export const environment = {
  production: true,
  yupiEnabled: false,
  terminologyApi: '/api',
  oauthIssuer: dynamicEnv.oauthIssuer,
  oauthClientId: dynamicEnv.oauthClientId,
  swaggerUrl: 'https://terminology.kodality.dev/swagger/',
  chefUrl: 'https://terminology.kodality.dev/chef',
};
