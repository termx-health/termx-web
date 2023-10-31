export const environment = {
  appVersion: 'dev',
  production: false,
  yupiEnabled: false,

   // termxApi: 'https://termx.kodality.dev/api',
  termxApi: 'http://localhost:8200',

  oauthIssuer: 'https://auth.kodality.dev/realms/terminology',
  oauthClientId: 'term-client',

  swaggerUrl: 'https://termx.kodality.dev/swagger/',
  chefUrl: 'https://termx.kodality.dev/chef',
  plantUmlUrl: 'https://termx.kodality.dev/plantuml',
  fmlEditor: 'https://termx.kodality.dev/fml-editor',

  snowstormUrl: 'https://snowstorm-public.kodality.dev/',
  snowstormDailyBuildUrl: 'https://snowstorm-public-dailybuild.kodality.dev/'
};
