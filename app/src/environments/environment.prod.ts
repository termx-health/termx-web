import {dynamicEnv} from './dynamic-env';

export const environment = {
  production: true,
  terminologyApi: '/api',
  oauthIssuer: dynamicEnv.oauthIssuer,
  oauthClientId: dynamicEnv.oauthClientId,
  swaggerUrl: 'https://terminology.kodality.dev/swagger/'
};
