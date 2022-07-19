import {dynamicEnv} from './dynamic-env';

export const environment = {
  production: true,
  terminologyApi: '',
  oauthIssuer: dynamicEnv.oauthIssuer,
  oauthClientId: dynamicEnv.oauthClientId
};
