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

  /**
   * Active skin. Either a built-in skin id ('main' | 'black' | 'cs-gov' | 'ee-gov' | 'lt-gov')
   * or a URL/path to an external skin JSON file (see {@link skinUrl}).
   */
  skin?: string,
  /** Explicit external skin file location, e.g. '/assets/skins/acme/skin.json'. Takes precedence over a built-in `skin` id. */
  skinUrl?: string,
  /** Inline branding overrides applied on top of whichever skin resolved (no rebuild needed). */
  branding?: SkinConfig,

  /** Enables the Space → MS DevOps (Azure) integration UI. Off until termx-server provides /spaces/{id}/msdevops/*. */
  msDevOpsEnabled?: boolean,
}

/**
 * Brandable fields shared by the runtime config and the in-app skin registry.
 * Kept here (not in app/core) so `environments/*` stays self-contained; the
 * `SkinDefinition` in app/core/skin extends this.
 */
export interface SkinConfig {
  id?: string,
  primaryColor?: string,
  headerColor?: string,
  headerText?: string,
  logo?: string,
  landingLogos?: string[],
  /** Arbitrary CSS custom properties set on :root, e.g. {'--border-radius': '0.5rem'}. */
  cssVars?: {[name: string]: string},
  /** External stylesheet URLs lazily injected as <link> when the skin is active. */
  stylesheets?: string[],
}
