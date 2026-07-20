import {TinyColor} from '@ctrl/tinycolor';
import {generate} from '@ant-design/colors';

/**
 * ng-zorro is compiled with ant-design's **variable** theme (see `styles/styles.less`), so every
 * primary-coloured control resolves `var(--ant-primary-*)` at runtime instead of a colour baked in
 * at LESS compile time. That is what lets a skin's `primaryColor` reach ant controls at all —
 * before it, `SkinConfig.primaryColor` only moved `--color-primary` (marina-ui + our own CSS) and
 * ant buttons/checkboxes/pickers kept the compiled default, so every skin needed a hand-written
 * `.ant-*` override block.
 *
 * The derivation mirrors ant-design v4's own `registerTheme`: the 1–10 palette comes from
 * `@ant-design/colors`, hover is shade 5, active is shade 7, and the `-deprecated-*` entries are
 * the legacy LESS-function equivalents that older components still reference.
 */
export const ANT_PRIMARY_VARS = [
  '--ant-primary-color',
  '--ant-primary-color-hover',
  '--ant-primary-color-active',
  '--ant-primary-color-outline',
  '--ant-primary-1', '--ant-primary-2', '--ant-primary-3', '--ant-primary-4',
  '--ant-primary-5', '--ant-primary-6', '--ant-primary-7',
  '--ant-primary-color-deprecated-l-35',
  '--ant-primary-color-deprecated-l-20',
  '--ant-primary-color-deprecated-t-20',
  '--ant-primary-color-deprecated-t-50',
  '--ant-primary-color-deprecated-f-12',
  '--ant-primary-color-active-deprecated-f-30',
  '--ant-primary-color-active-deprecated-d-02',
] as const;

/**
 * Build the full `--ant-primary-*` set from one base colour.
 * Returns an empty object for a colour ant-design can't parse, so a bad skin value leaves the
 * compiled defaults in place rather than blanking the palette.
 */
export function antPrimaryPalette(base: string): Record<string, string> {
  const parsed = new TinyColor(base);
  if (!parsed.isValid) {
    return {};
  }
  const p = generate(base);
  const shade1 = new TinyColor(p[0]);
  return {
    '--ant-primary-color': base,
    '--ant-primary-color-hover': p[4],
    '--ant-primary-color-active': p[6],
    '--ant-primary-color-outline': parsed.clone().setAlpha(0.2).toRgbString(),
    '--ant-primary-1': p[0],
    '--ant-primary-2': p[1],
    '--ant-primary-3': p[2],
    '--ant-primary-4': p[3],
    '--ant-primary-5': p[4],
    '--ant-primary-6': p[5],
    '--ant-primary-7': p[6],
    '--ant-primary-color-deprecated-l-35': parsed.clone().lighten(35).toHexString(),
    '--ant-primary-color-deprecated-l-20': parsed.clone().lighten(20).toHexString(),
    '--ant-primary-color-deprecated-t-20': parsed.clone().tint(20).toHexString(),
    '--ant-primary-color-deprecated-t-50': parsed.clone().tint(50).toHexString(),
    '--ant-primary-color-deprecated-f-12': parsed.clone().setAlpha(0.12).toRgbString(),
    '--ant-primary-color-active-deprecated-f-30': shade1.clone().setAlpha(0.3).toRgbString(),
    '--ant-primary-color-active-deprecated-d-02': shade1.clone().darken(2).toHexString(),
  };
}
