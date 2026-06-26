import {SkinConfig} from 'environments/environment.base';

/**
 * A resolved skin. Extends the brandable {@link SkinConfig} (shared with the runtime
 * env config) with an id and an optional code hook. External JSON skins may only carry
 * the {@link SkinConfig} fields — never `registerWebComponents` — so they cannot ship code.
 */
export interface SkinDefinition extends SkinConfig {
  id: string;
  /** Built-in-only hook to register design-system web components when the skin activates. */
  registerWebComponents?: () => Promise<void>;
}

/** Default TermX look. No-op skin (applied when nothing is configured). */
const MAIN: SkinDefinition = {id: 'main'};

/**
 * Built-in dark skin. The dark CSS-variable palette lives in styles/theme.less under
 * `html[data-skin="black"]`; this entry just selects it. Independent of the per-user
 * light/dark theme toggle (PreferencesService).
 */
const BLACK: SkinDefinition = {id: 'black'};

/** Czech NCEZ / MZČR (Ministry of Health) skin — branding-only by default. */
const CS_GOV: SkinDefinition = {
  id: 'cs-gov',
  primaryColor: '#1464C0',
  headerText: 'NCEZ',
  landingLogos: [
    'assets/skins/cs-gov/generated_image.png',
    'assets/skins/cs-gov/CS_FundedbytheEU_RGB_POS.svg',
    'assets/skins/cs-gov/ncez-rgb.png',
    'assets/skins/cs-gov/MZCR_sh_RGB_p.gif',
  ],
  // To enable the full gov.cz design-system look, serve its CSS from assets and list it
  // here (lazily injected when the skin is active). See docs/skins.md.
  // stylesheets: ['assets/skins/cs-gov/gov-design-system.css'],
};

/** Estonian government skin — scaffold. TODO: official ee-gov design tokens + logos. */
const EE_GOV: SkinDefinition = {
  id: 'ee-gov',
  primaryColor: '#0050a0',
};

/** Lithuanian government skin — scaffold. TODO: official lt-gov design tokens + logos. */
const LT_GOV: SkinDefinition = {
  id: 'lt-gov',
  primaryColor: '#be1e2d',
};

/** Built-in skin registry, keyed by id. `default` aliases `main`. */
export const BUILTIN_SKINS: {[id: string]: SkinDefinition} = {
  'main': MAIN,
  'default': MAIN,
  'black': BLACK,
  'cs-gov': CS_GOV,
  'ee-gov': EE_GOV,
  'lt-gov': LT_GOV,
};
