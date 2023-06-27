import {dynamicEnv} from './dynamic-env';

export const environment = {
  production: true,
  yupiEnabled: false,
  termxApi: '/api',
  oauthIssuer: dynamicEnv.oauthIssuer,
  oauthClientId: dynamicEnv.oauthClientId,
  swaggerUrl: 'https://termx.kodality.dev/swagger/',
  chefUrl: 'https://termx.kodality.dev/chef',
};
