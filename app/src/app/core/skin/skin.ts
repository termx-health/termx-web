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
  // Authentic NCEZ brand palette (extracted from the NCEZ logo): navy primary + amber accent.
  primaryColor: '#183C62',
  headerColor: '#183C62',
  // NCEZ palette: navy primary, amber accent; magenta + lime are tertiary marks (kept available
  // as CSS vars for small accents — not applied prominently to avoid competing with navy/amber).
  cssVars: {'--skin-accent': '#F7B935', '--skin-accent-2': '#D21747', '--skin-accent-3': '#C2CD21'},
  logo: 'assets/skins/cs-gov/ncez-rgb.png',
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

/**
 * Estonian government skin — design tokens from TEHIK's AKK (Andmekirjelduskeskkond) deployment,
 * which until now carried them as a compiled-in theme in its own shell application.
 *
 * The primary is AKK's brand cyan-blue at the nearest shade that meets WCAG AA: the original
 * `#0083ba` reaches only 4.24:1 on white, below the 4.5:1 needed for normal text, and the primary
 * is used for headings and card titles. `#007cb0` keeps the hue (197.7°) and saturation (100%)
 * and drops lightness 36.5% → 34%, giving 4.66:1 — visually near-identical, and consistent with
 * the contrast floor marina-ui already holds itself to for secondary text and placeholders.
 *
 * Deliberately not carried over from AKK: `--page-header-height: 0` and
 * `--header-border-bottom-width: 0` suppress TermX's own header because that shell supplies its
 * own navbar — a standalone TermX would lose its header. Institutional logos and the MTA corporate
 * stylesheet stay with the deployment; serve them via `stylesheets`/`logo` (see docs/skins.md).
 */
const EE_GOV: SkinDefinition = {
  id: 'ee-gov',
  primaryColor: '#007cb0',
  cssVars: {
    '--color-background': '#dbdfe2',
    '--border-radius': '0.3em',
    '--border-radius-component': '6px',
  },
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
