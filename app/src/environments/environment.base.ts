export const UI_LANGS = ['en', 'et', 'lt', 'de', 'fr', 'nl', 'cs'];

export interface Environment {
  appVersion: string,
  production: boolean,
  yupiEnabled: boolean,
  baseHref: string,

  defaultLanguage: string,
  uiLanguages: string[],
  contentLanguages: string[],
  /**
   * How lang is translated in other languages
   *
   * @example
   * extraLanguages: {
   *   ar: {
   *     en: "Arabic",
   *     et: "Araabia"
   *   }
   * },
   */
  extraLanguages: {[lang: string]: {[k: string]: string}},

  oauthIssuer: string,
  oauthClientId: string,
  oauthScope: string,

  termxApi: string,
  swaggerUrl?: string,
  chefUrl?: string,
  plantUmlUrl?: string,
  fmlEditor?: string,

  snowstormUrl?: string,
  snomedBrowserUrl?: string,
  snowstormDailyBuildUrl?: string,
  snomedBrowserDailyBuildUrl?: string,
}
