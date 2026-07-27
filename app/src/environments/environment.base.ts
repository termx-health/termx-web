export const UI_LANGS = ['en', 'et', 'lt', 'de', 'fr', 'nl', 'cs'];

export interface Environment {
  appVersion: string,
  production: boolean,
  yupiEnabled: boolean,
  embedded: boolean,
  /**
   * External-chrome mode: a host application supplies its own navbar/sidebar/footer around TermX,
   * so TermX's own top header is suppressed and the content reclaims the space. Unlike `embedded`
   * (the `/embedded/*` iframe sandbox), routing stays normal — the host's chrome links to real
   * TermX routes. Enabling this commits the deployment to providing its own login/navigation, since
   * those live in the hidden header. Set via `EXTERNAL_CHROME`.
   */
  externalChrome?: boolean,
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
  /**
   * Extra translation catalogues merged on top of the built-in `assets/i18n/{lang}.json`.
   *
   * URL templates containing `{lang}`, loaded in order; later entries win on key collision. Lets a
   * deployment add or reword strings by serving its own file, instead of editing the bundled ones.
   * A source that 404s is skipped, so a catalogue need not cover every UI language.
   *
   * @example i18nOverlays: ['./assets/locales/{lang}.json']
   */
  i18nOverlays?: string[],

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

  /**
   * Source of the navigation menu. A path or URL returning the same JSON shape as the bundled
   * `assets/menu.json` (a `FileMenu[]`). Lets a deployment serve its own menu — a static override
   * mounted under `/assets`, or a menu service endpoint — without a rebuild. Defaults to the
   * bundled `./assets/menu.json` when unset. Menu entries whose `link` targets a route this build
   * does not have are disabled automatically, so a shared menu can list routes not present here.
   */
  menuUrl?: string,

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
