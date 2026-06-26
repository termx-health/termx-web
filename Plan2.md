# Plan 2 — Additional fork features (roadmap)

Follow-up track to Plan 1 (skin switching + file-import template loader + MS DevOps UI, delivered on
branch `feature/skin-switching`). Plan 2 ports the remaining genuinely-useful features found in the
Czech NCEZ/MZČR fork (`~/Downloads/termx-web-dev_new`, Angular 16) into mainline termx-web.

Each item below lists: **frontend work** (termx-web), **required backend services** (termx-server —
several do not exist yet and are the gating dependency), classification, and verification.

Legend: **GENERAL** = ship in core · **CUSTOMER** = Czech-only, ships in the `cs-gov` skin/asset bundle ·
🟢 no backend needed · 🟠 backend extension needed · 🔴 new backend service needed.

---

## Missing backend services — summary (termx-server)

The single biggest risk in Plan 2 is backend coverage. These endpoints are referenced by the fork's
frontend but are **not confirmed present** in mainline termx-server. Implement/verify these first:

| # | Service / endpoints | Used by | Status |
|---|---|---|---|
| 1 | `GET /wiki-export/export-pdf?spaceId=&pageId=` · `GET /wiki-export/export-html?...` → returns a file blob | Wiki PDF/HTML export | 🔴 verify/implement |
| 2 | `GET /ts/measurement-units` (search) · `GET /ts/measurement-units/{id}` · `GET /ts/measurement-units/kinds` · `POST/PUT /ts/measurement-units` | Measurement-unit registry | 🔴 implement |
| 3 | `GET /spaces/msdevops/providers` · `GET /spaces/{id}/msdevops` · `POST /spaces/{id}/msdevops/authenticate` · `GET /spaces/{id}/msdevops/status` · `GET /spaces/{id}/msdevops/diff?file=` · `POST /spaces/{id}/msdevops/push` · `POST /spaces/{id}/msdevops/pull` | MS DevOps (Plan 1 UI shipped, **flag-gated off**) | 🔴 implement to un-gate Plan 1 §C |
| 4 | Server (terminology-server) registration model + persistence extended with OAuth2 `clientId`/`clientSecret` + custom headers | Terminology-server auth config | 🟠 extend existing `/spaces/.../servers` |
| 5 | OR-CZ converter service (`orczApi`, separate base URL): `GET {orczApi}/getconfig?configSource=` · `POST {orczApi}/convert{Type}` · `POST {orczApi}/xmlImport` · `POST {orczApi}/convertFhirSync`. Externalize the fork's hardcoded `asseco:test` credentials. | Custom XML import (OR-CZ) | 🔴 customer-specific service |
| 6 | SMART App Launch: token endpoint + the app must read FHIR server `/metadata` for OAuth URLs (mostly client-side, but needs a registered SMART client on the auth server). | SMART-on-FHIR auth | 🔴 config + auth-server client |

NCLP dashboard / custom property layouts (item 6 below) need **no new endpoints** — they reuse existing
code-system/concept APIs; the customer specifics are configuration (hardcoded CS IDs → injected config).

---

## 1. Wiki PDF / HTML export 🟠 GENERAL

**Frontend** (`app/src/app/wiki/page/containers/wiki-page-details.component.{ts,html}`):
- Add an "Export → PDF / HTML" action to the wiki page header.
- Call the backend export endpoint, receive a `Blob`, trigger a download named `Wiki-{space}-{page}.{ext}`
  (mirror fork `wiki-page-details.component.ts:185-196`). Use `HttpClient.get(url, {responseType: 'blob'})`.
- Optional: port the DOMPurify content sanitizer (`wiki/page/services/wiki-contentSanitizer.service.ts`)
  as independent security hardening for rendered wiki HTML (`dompurify` is already a dependency).

**Backend (service #1):** `GET /wiki-export/export-pdf` and `/export-html` taking `spaceId` (+ page identifier),
rendering the page (and optionally its subtree) to a downloadable file. The fork delegates entirely to this
server service — there is **no** client-side PDF library. Confirm whether mainline termx-server has a
`wiki-export` module; if not, it must be built (HTML render → headless-Chrome/wkhtmltopdf style PDF, or a
server-side markdown→PDF pipeline).

**Verify:** open a wiki page → Export PDF → a valid PDF downloads with the page content; Export HTML → valid HTML.

---

## 2. Keyboard shortcuts + help dialog 🟢 GENERAL

**Frontend** (new `app/src/app/core/shortcuts/`):
- Port `shortcut.service.ts` — a global `keydown` listener with Ctrl/Alt/Shift modifier mapping and
  per-context shortcut registration with description labels.
- Port the help component, but render the shortcut list in **`MuiModalModule`** (the fork used `<gov-dialog>`;
  do not pull in gov-design-system for a core feature).
- Register `ShortcutService` in `AppComponent`'s constructor; bind `?` to open the help modal.
- Add i18n keys for shortcut descriptions.

**Backend:** none.

**Verify:** registered shortcuts fire their handlers; `?` opens a modal listing all active shortcuts with keys.

---

## 3. Global-search enhancements + small wins 🟢 GENERAL

**Frontend** (`app/src/app/global-search/containers/global-search-dashboard.component.{ts,html}`):
- **Value-set scoping filter:** add `filter.valueSets` + a `tw-value-set-search` control; when set, scope the
  code-system/value-set search to within that value set (fork `:137`).
- **Clickable search icon + tooltips** on the search/filter affordances (fork HTML `:9-10`).
- **Configurable space quick-filter buttons:** the fork hardcoded `NCLP / DASTA / UZIS`. Generalize to a
  config-driven list (e.g. read space codes from runtime config or the user's accessible spaces) so the
  buttons are not Czech-specific. The Czech preset ships in the `cs-gov` bundle.
- **`translateList` pipe:** port the tiny `core/utils/TranslatePipe.ts` (split CSV → translate each token →
  join) into `core/utils` and register it where comma-separated enum/privilege lists are displayed.
- Drop the fork's `.view`→`.read` privilege regressions (mainline already uses `.read`).

**Backend:** none (uses existing search endpoints).

**Verify:** value-set filter narrows results; config-driven space buttons filter by space; `translateList`
renders translated comma lists.

---

## 4. Terminology-server OAuth2 auth config 🟠 GENERAL (extends existing)

Mainline already has terminology-server management as `Server*` (`/space/servers/*`). The only fork extra is
**auth configuration** on a registered server.

**Frontend** (`app/src/app/sys/space/containers/server/server-edit.*` + `Server` model/service):
- Add OAuth2 fields: `clientId`, `clientSecret` (masked input), and optional custom request headers.

**Backend (service #4):** extend the existing server-registration model + persistence to store and use these
auth fields when calling the external terminology server. No new endpoints — extend the existing ones.

**Verify:** save a server with OAuth2 creds (secret masked) → the server authenticates and its resources load.

---

## 5. Custom XML import framework (generalize OR-CZ) 🔴 CUSTOMER adapter

**Frontend** (new `app/src/app/integration/import/` abstraction):
- Build a **pluggable XML-importer** abstraction: config-driven resource-type mapping, externalized
  endpoint + credentials (no hardcoded `asseco:test`). The Czech OR-CZ adapter (resource types
  `nclp/dasta/nzis/dlp`) ships in the `cs-gov` bundle, not core.
- Port from fork `integration/_lib/or-cz/*` and `integration/import/or-cz/**`, removing hardcoded secrets.

**Backend (service #5):** the OR-CZ converter is a **separate service** at its own base URL (`orczApi`,
distinct from `termxApi`): `GET /getconfig?configSource={type}`, `POST /convert{Type}`, `POST /xmlImport`,
`POST /convertFhirSync`. This is customer infrastructure (Asseco registry); credentials must come from
config/secrets, not source. Add `orczApi` to the runtime env config.

**Verify:** a sample adapter imports a fixture XML through the converter into a code system.

---

## 6. NCLP dashboard + custom concept-property editors 🔵 CUSTOMER (config-driven)

Largest/most invasive item. The fork's `code-system-property-value-edit.component.ts` ballooned to ~1208 lines
of Czech NČLP lab-procedure layout/validation logic, plus `nclp/dashboard`, `custom-map.ts`, `group-skala.ts`,
`layout-map.factory.ts`, and a `gov-dialog` wrapper.

**Frontend (generalize, do not copy verbatim):**
- Extract a **config-driven concept-property layout** system: a `LayoutMap` interface + a factory that resolves
  layouts by code-system id, loading the layout config from **injected JSON** (not hardcoded). Feature-flag the
  layout/validation logic added to `code-system-property-value-edit.component.ts` so default behavior is unchanged.
- The Czech NČLP layout config + the multi-tab NCLP dashboard ship in the `cs-gov` bundle. Render dialogs in
  `MuiModalModule`, not `gov-dialog`.

**Backend:** none new — reuses existing code-system/concept APIs. The fork's hardcoded CS IDs (`idSlpPolozky`,
etc.) become deployment config.

**Verify:** with a feature-flagged config, grouped property layouts render; flag off → property editor unchanged.

---

## 7. SMART-on-FHIR auth 🔴 GENERAL (re-implement)

The fork's `core/auth/smart/*` is **fully commented out / abandoned** — do not resurrect it.

**Frontend (fresh, from the SMART App Launch spec):**
- Detect `?iss=` / `?launch=` params, read the FHIR server `/metadata` for the OAuth authorize/token URLs,
  redirect to authorize, exchange the auth code for a bearer token, store it, and add an `Authorization: Bearer`
  (+ `X-Smart-Iss`) HTTP interceptor.

**Backend (service #6):** a registered SMART client on the auth server (client id/scopes) and a reachable FHIR
server exposing `/metadata`. No bespoke termx-server endpoint, but auth-server + FHIR-server configuration is required.

**Verify:** a SMART launch (`?iss=&launch=`) yields a bearer token applied to protected calls.

---

## 8. Measurement-unit registry 🔴 GENERAL (optional)

A writable registry of measurement units with external mappings — **distinct from UCUM** (UCUM stays the
read-only standard-operations library; the two coexist).

**Frontend** (port `app/src/app/measurement-unit/**`):
- Module with list / edit / view + a mappings list (model: `{id, code, name, alias, period, ordering, rounding,
  kind, definitionUnit/Value, mappings[]}`; mapping: `{system, systemUnit, systemValue}`).
- Add measurement-unit results to global search (fork integrated it there).

**Backend (service #2):** `GET /ts/measurement-units` (search), `GET /ts/measurement-units/{id}`,
`GET /ts/measurement-units/kinds`, `POST/PUT /ts/measurement-units` — standard CRUD. Does not exist in mainline.

**Verify:** CRUD a measurement unit + mapping; it appears in global search.

---

## Suggested sequencing

1. **Un-gate Plan 1 §C** — implement MS DevOps backend (service #3), then flip `msDevOpsEnabled` and runtime-verify.
2. **Quick GENERAL wins, no backend:** keyboard shortcuts (§2), global-search + `translateList` (§3).
3. **Backend-extension wins:** terminology-server OAuth2 (§4, service #4), Wiki export (§1, service #1).
4. **Larger:** measurement-unit registry (§8, service #2), SMART auth (§7).
5. **Customer-specific (cs-gov bundle):** NCLP layouts (§6), OR-CZ XML import (§5, service #5).

## Notes

- Everything tagged CUSTOMER belongs in the `cs-gov` skin/asset bundle (see `docs/skins.md`), never mainline core.
- The fork's framework-noise diffs (Angular 16→21, kodality→termx-health rename, `measurement-unit`-as-UCUM,
  oversized refactored files) are intentionally **not** ported — mainline is newer/superior there.
- Original analysis + Plan 1 detail: `~/.claude/plans/mossy-gathering-leaf.md`.
