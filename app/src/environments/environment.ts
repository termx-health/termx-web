export const environment = {
  appVersion: require('../../../package.json').version,
  production: false,
  yupiEnabled: false,

  termxApi: 'https://termx.kodality.dev/api',
  // termxApi: 'http://localhost:8200',

  oauthIssuer: 'https://auth.kodality.dev/realms/terminology',
  oauthClientId: 'term-client',

  swaggerUrl: 'https://termx.kodality.dev/swagger/',
  chefUrl: 'https://termx.kodality.dev/chef',
  plantUmlUrl: 'https://termx.kodality.dev/plantuml',
  fmlEditor: 'https://termx.kodality.dev/fml-editor',

  snowstormUrl: 'https://snowstorm-public.kodality.dev/',
  snowstormDailyBuildUrl: 'https://snowstorm-public-dailybuild.kodality.dev/',

  defaultLanguage: 'en',
  languages: [
    {code: 'en', names: {'en': 'English', 'et': 'Inglise', 'ru': 'Английский', 'lt': 'Anglų', 'de': 'Englisch', 'fr': 'Anglais', 'nl': 'Engels'}},
    {code: 'et', names: {'en': 'Estonian', 'et': 'Eesti', 'ru': 'Эстонский', 'lt': 'Estų', 'de': 'Estnisch', 'fr': 'Estonien', 'nl': 'Ests'}},
    {code: 'lt', names: {'en': 'Lithuanian', 'et': 'Leedu', 'ru': 'Литовский', 'lt': 'Lietuvių', 'de': 'Litauisch', 'fr': 'Lituanien', 'nl': 'Litouws'}},
    {code: 'de', names: {'en': 'German', 'et': 'Saksa', 'ru': 'Немецкий', 'de': 'Deutsch', 'fr': 'Allemand', 'nl': 'Duits'}},
    {code: 'fr', names: {'en': 'French', 'et': 'Prantsuse', 'ru': 'Французский', 'de': 'Französisch', 'fr': 'Français', 'nl': 'Frans'}},
    {code: 'nl', names: {'en': 'Dutch', 'et': 'Hollandi', 'ru': 'Голландский', 'de': 'Niederländisch', 'fr': 'Néerlandais', 'nl': 'Nederlands'}}
  ]
};
