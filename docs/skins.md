# Skins (branding & theming)

TermX supports per-deployment **skins**: branding (logo, header text/color, primary color),
design tokens, and extra stylesheets — selectable at deploy time via runtime config, **no rebuild**.

Skins are orthogonal to the per-user **light/dark theme** toggle (the moon switch in the user menu),
which is a personal preference stored in `localStorage`.

## Selecting a skin

Set one of these (via `env.js` substitution / container env vars):

| Env var | Meaning |
|---|---|
| `SKIN` | A built-in skin id, **or** a path/URL to an external skin JSON file. |
| `SKIN_URL` | Explicit external skin file location (takes precedence over a built-in `SKIN` id). |
| `BRANDING` | Inline JSON overrides merged on top of the resolved skin. |

Built-in skin ids: `main` (default), `black` (dark palette), `cs-gov`, `ee-gov`, `lt-gov`.

```sh
# Built-in
SKIN=cs-gov

# External customer skin file (mount the folder under assets and point at it)
SKIN_URL=/assets/skins/acme/skin.json

# Or quick inline overrides, no file needed
BRANDING={"headerText":"ACME","primaryColor":"#0a7d3c"}
```

## Skin file schema

An external skin is a JSON object with these (all optional) fields:

```jsonc
{
  "id": "acme",
  "primaryColor": "#0a7d3c",          // sets --color-primary / --primary-color
  "headerColor": "#0a7d3c",           // sets the app header background
  "headerText": "ACME Terminology",   // shown next to the app title
  "logo": "/assets/skins/acme/logo.svg",
  "landingLogos": ["/assets/skins/acme/eu.svg"],  // footer strip on the landing page
  "cssVars": { "--border-radius": "0.5rem" },     // arbitrary :root CSS variables
  "stylesheets": ["/assets/skins/acme/overrides.css"]  // lazily injected <link>s
}
```

External skins are **CSS + branding + tokens only** — they cannot ship JavaScript or register
web components (that is reserved for built-in skins). A malformed or unreachable skin file falls
back to `main` without breaking the app.

## Adding assets

Mount skin assets anywhere served under `/assets/` (e.g. `app/src/assets/skins/<id>/` in source,
which builds to `/assets/skins/<id>/`). Reference them with paths relative to the deployment base href.

## Built-in skins

- **`main`** — default TermX look (no-op).
- **`black`** — curated dark palette (marina-ui CSS variables; see `styles/theme.less`).
- **`cs-gov`** — Czech NCEZ / MZČR branding (logos under `assets/skins/cs-gov/`, primary `#1464C0`).
  Branding-only by default; to enable the full gov.cz design-system look, serve its CSS and add it
  to the skin's `stylesheets` (see the registry in `app/src/app/core/skin/skin.ts`).
- **`ee-gov`, `lt-gov`** — Estonian / Lithuanian scaffolds (primary color only; official design
  tokens + logos TODO).

To add or change a built-in skin, edit `app/src/app/core/skin/skin.ts`.
