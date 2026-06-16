export const UI_LANGS = ['en', 'et', 'lt', 'de', 'fr', 'nl', 'cs'];

export interface Environment {
  appVersion: string,
  production: boolean,
  yupiEnabled: boolean,
  embedded: boolean,
  baseHref: string,
  guestDisabled: boolean,

  defaultLanguage: string,
  /**
   * Regional locale used to format dates for the English UI language ('en-GB' or 'en-US').
   * Controls day/month order: en-GB -> 15 Jun 2026 / 15/06/2026, en-US -> Jun 15, 2026 / 6/15/2026.
   * Defaults to 'en-GB'.
   */
  englishLocale?: string,
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
  chefFhirVersion?: string,
  plantUmlUrl?: string,
  fmlEditor?: string,
  /** Base URL of the external FHIR→UML converter (fhir2uml). When unset, the StructureDefinition UML tab is hidden. */
  fhirUmlConverterApi?: string,

  snowstormUrl?: string,
  snomedBrowserUrl?: string,
  snowstormDailyBuildUrl?: string,
  snomedBrowserDailyBuildUrl?: string,
}
