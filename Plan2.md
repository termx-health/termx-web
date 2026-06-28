# Plan 2 — Strategic architecture + remaining ports (roadmap)

Follow-up track to Plan 1 (skin switching + file-import template loader + MS DevOps UI). Plan 2 is
**strategic-first**: the two big directions are a **plugin infrastructure** for third-party apps and a
**CodeSystem/ValueSet view & editor factory** (which generalizes the Czech NCLP dashboard). Both are
**gated** on Phase 0 — obtaining the **CZ backend project** and a comparative analysis of the three real
extension strategies to converge on ONE common plugin / docker-extension approach.

**What may start now vs. what waits:**
- **Track Q (frontend quick wins)** — no backend → **✅ done (PR #105)**.
- **Strategic Tracks 1 & 2** and **Track P (backend-dependent ports)** — **wait** for Phase 0 / their backends.

Legend: 🟢 no backend · 🟠 backend extension · 🔴 new backend service · ⏳ gated.

---

## Missing / required backend services — summary (termx-server & friends)

| # | Service / endpoints | Used by | Status |
|---|---|---|---|
| 1 | `GET /wiki-export/export-pdf?spaceId=&pageId=` · `GET /wiki-export/export-html?...` → file blob | Wiki PDF/HTML export | 🔴 verify/implement |
| 2 | MS DevOps stub already added in termx-server (`SpaceMsDevOpsController`); replace with a **real Azure DevOps git sync** to un-gate the Plan 1 UI | MS DevOps | 🟠 stub→real |
| 3 | Terminology-server (`Server*`) model + persistence extended with OAuth2 `clientId`/`clientSecret`/`tokenUrl`/`scope` + custom headers; token fetch + per-server cache; secret encrypted at rest | Terminology-server auth config | 🟠 extend existing |
| 4 | OR-CZ converter service (separate `orczApi`): `GET /getconfig?configSource=` · `POST /convert{Type}` · `POST /xmlImport` · `POST /convertFhirSync`; externalize the fork's hardcoded `asseco:test` creds | Custom XML import (OR-CZ) | 🔴 CZ-backend service |
| 5 | SMART App Launch: registered SMART client (client_id/redirect_uri/scopes/PKCE) on the auth server + a reachable FHIR server exposing `/metadata` (mostly client-side; no bespoke termx-server endpoint) | SMART-on-FHIR auth | 🔴 config + auth-server client |
| 6 | Plugin SPI surface (`termx-plugin-api`) + sample plugin module/sidecar — **shape decided by Phase 0** | Plugin infrastructure | ⏳ after Phase 0 |

The view/editor factory (Track 2) needs **no new endpoints** — it reuses existing code-system/concept APIs;
the customer specifics are configuration on the resource definition.

Measurement-unit registry is **out of scope** — it was intentionally removed from TermX; do not reintroduce.

---

## Phase 0 — Comparative analysis & architecture decision (GATING; do first) ⏳

Pick ONE common plugin / docker-extension model by analyzing how the three real consumers extend TermX:
- **LMB fork** (`lmb-terminology-server`, e-medlab): **hard fork** + Gradle subproject *editions*
  (`edition-est/uzb/int`) with dependency substitution; publishes artifacts; **docker-compose orchestration**
  pulling separate `termx-server`/`termx-web` images. → backend extension = build-time Gradle modules.
- **EE project** (`terminology-explorer`, e-medlab): **standalone** Spring Boot 4 + Angular 20; reuses TermX
  *only* via the published `@termx-health/structure-definition-viewer` + FHIR APIs; **content-negotiation
  routing** + `ecosystem.json`; **combined docker image**. → API consumer, not a fork.
- **CZ backend** (not yet available — the "backend project" we are waiting for): OR-CZ converter + NCLP backend.

**Existing seams to build on:**
- *Backend SPI:* Micronaut `List<Interface>` + `@Singleton` auto-collection — `SpaceGithubDataHandler`,
  `SpaceResourceProvider`, `ResourceContentProvider` (in `termx-core`/`termx-api`). Build-time Gradle modules → fat `-all.jar`.
- *Frontend:* `@angular/elements` web components already exported (`ce-code-system-concept-matrix`,
  `ce-value-set-concept-matrix`, `ce-structure-definition`, `ce-wiki-comment-popover`); **embedded mode**
  (`/embedded/*` sandbox); runtime `assets/menu.json` loading.
- *Shared/deploy:* `web-commons` npm packages; root `docker-compose.yml` + env config; EE's content-negotiation + `ecosystem.json`.

**Decision to produce:** build-time plugins (Gradle module + Angular build composition; like LMB) vs runtime /
docker extensions (sidecar services + iframe/web-component embedding + dynamic menu & `ecosystem.json`; like EE),
or a hybrid. Output = the plugin contract + docker-extension model that Tracks 1 & 2 implement.

## Strategic Track 1 — Plugin infrastructure (skeleton: web-app + backend) ⏳

- **Backend plugin SPI:** formalize a `termx-plugin-api` (existing handler/provider interfaces + a manifest) and a
  **sample plugin Gradle module** implementing one provider, auto-discovered via Micronaut collection injection.
  If Phase 0 picks runtime/docker: a **sidecar** variant registered via config (`ecosystem.json`-style).
- **Frontend plugin host:** a registry that (a) merges plugin menu entries into the runtime `menu.json`,
  (b) hosts third-party UIs via exported web components and/or sandboxed `/embedded` iframes, (c) lets plugins
  register Angular components into the view/editor factory (Track 2). Skeleton = one sample third-party web-app
  embedded + one exported TermX component consumed externally.

## Strategic Track 2 — CodeSystem/ValueSet view & editor factory ⏳

Generalizes NCLP: the resource definition selects its optimal UI.
- **Config store (the "TermX extension"):** add `viewType?: string` to `CodeSystem.settings` / `ValueSet.settings`
  (`resources/_lib/code-system/model/code-system.ts:40`, `value-set.ts:21`); edit it via the existing
  resource-configuration-attributes mechanism (`termx-resource-configuration` CodeSystem,
  `resource/components/resource-configuration-attributes.component.ts`).
- **`ViewComponentFactory`:** registry mapping `(resourceType, viewType) → component class` (pattern from the
  fork's `LayoutMapFactory`). **Injection point:** `CodeSystemConceptsComponent`
  (`resources/code-system/containers/concepts/code-system-concepts.component.ts:13-35`) loads the variant
  dynamically instead of hardcoding `CodeSystemConceptsListComponent`. Summary widgets similarly.
- **Built-in view types:**
  - `default` — current tree+table (`CodeSystemConceptsListComponent`).
  - `loinc` — refactor `integration/loinc/loinc-dashboard.component.ts` from a standalone route into a view variant.
  - `nclp-dashboard` — generalize the CZ tabbed wrapper + **config-driven property layouts**: extract
    `LayoutMap`/`LayoutMapFactory` to load layouts from injected JSON, feature-flagged; Czech NČLP config ships in `cs-gov`.
  - `editable-table` — new inline-editable grid view.
- Plugins (Track 1) can register additional view types into the same factory.

## Track Q — Frontend quick wins (no backend) ✅ DONE (PR #105)

Delivered: keyboard shortcuts + help dialog (MuiModal); global-search clickable search icon + tooltips and
config-driven space quick-filter buttons (`environment.globalSearchSpaces`); `translateList` pipe.

Deliberately dropped (not pending): the **wiki DOMPurify sanitizer** (mainline already sanitizes via
`m-quill`/`m-markdown`; the strict allowlist would strip valid Quill formatting) and the **value-set scoping
filter** (`ConceptSearchParams` has no clean value-set scope; the fork's version was a weak text-override).

## Track P — Backend-dependent ports ⏳

- **Wiki PDF/HTML export** (🔴 service #1): export button on `wiki/page/containers/wiki-page-details.component.{ts,html}`
  → download blob `Wiki-{space}-{page}.{ext}` (mirror fork `:185-196`); verify/build the `wiki-export` service first.
- **Custom XML import framework** (🔴 service #4): pluggable XML-importer abstraction in `integration/import/`,
  externalized endpoint/creds; the Czech OR-CZ/Asseco adapter ships in `cs-gov`. Needs the CZ-backend `orczApi`.

### Terminology-server OAuth2 auth config (🟠 service #3 — detail)
Mainline already has terminology-server management as `Server*` (`/space/servers/*`); the fork adds **auth config**.
- **Model:** extend `Server` (termx-web `sys/_lib/space` model + termx-server `TerminologyServer`) with
  `authType` (`none|basic|oauth2|apikey`), `clientId`, `clientSecret`, `tokenUrl`, `scope`, and optional custom headers.
- **Frontend** (`sys/space/.../server` edit form): an "Authentication" section; **`clientSecret` is a masked,
  write-only input** — never echo the stored secret; the API returns a `secretSet: boolean`. Headers as a key/value list.
- **Backend:** when TermX calls the external server (`TerminologyServerResourceProvider` / the server HTTP client),
  run **OAuth2 client-credentials**: `POST tokenUrl` with client id/secret + scope, **cache the bearer token per
  server with expiry**, attach `Authorization` + custom headers. **Store the secret encrypted at rest.**
- **Privileges:** reuse the existing server-edit authorization (no new privilege).
- **Verify:** register a server with OAuth2 client-credentials against a protected CTS/FHIR endpoint → token fetched
  + cached, resources load, secret never returned to the UI.

### SMART-on-FHIR auth (🔴 service #5 — detail; re-implement, fork code is dead/commented)
Implement SMART App Launch fresh (EHR launch + standalone launch). New `core/auth/smart/`:
- **Launch detection:** read `iss` (FHIR base) + `launch` (opaque) query params [EHR launch], or a configured `iss` [standalone].
- **Discovery:** `GET {iss}/metadata` (or `/.well-known/smart-configuration`) → `authorization_endpoint`,
  `token_endpoint`, supported scopes, PKCE support.
- **Authorization redirect:** `response_type=code`, `client_id`, `redirect_uri`, `scope`
  (e.g. `launch openid fhirUser patient/*.read`), `state`, `aud={iss}`, `launch`, **PKCE** `code_challenge`.
- **Token exchange:** on redirect back, `POST token_endpoint` with `code` + PKCE `code_verifier` → `access_token`
  (+ `id_token`, patient context). Store token + `iss` (+ patient) in **`sessionStorage`** (not localStorage).
- **HTTP interceptor:** attach `Authorization: Bearer {token}` (+ `X-Smart-Iss` if needed); handle expiry/refresh.
- **Wiring:** a `SmartAuthService` + interceptor, gated by a config flag (`smartEnabled`/`iss`); **coexists with the
  existing OIDC** (`angular-auth-oidc-client`) — SMART is an alternate provider selected by launch context.
- **Backend/config:** a registered SMART client (client_id, redirect_uri, scopes, PKCE) on the auth server / EHR,
  and a reachable FHIR server exposing `/metadata`. No bespoke termx-server endpoint.
- **Verify:** an EHR/standalone launch (`?iss=&launch=`) completes the code+PKCE flow and applies the bearer token
  to protected calls; token in `sessionStorage`; logout clears it.

## Removed from scope
- **Measurement-unit registry** — **intentionally removed from TermX**; do not reintroduce.

## Sequencing
1. ~~**Track Q** (no backend)~~ — ✅ done (PR #105).
2. **Phase 0** comparative analysis once the CZ backend project arrives → decide the plugin/docker-extension model.
3. **Strategic Tracks 1 & 2** (plugin infra + view/editor factory) on the chosen architecture.
4. **Track P** ports as each backend lands (MS DevOps real impl, terminology-server OAuth2, Wiki export, OR-CZ, SMART).

## Notes
- CUSTOMER-tagged work (Czech NCLP config, OR-CZ adapter, ministry branding) belongs in the `cs-gov` skin/asset
  bundle (see `docs/skins.md`), never mainline core.
- Framework-noise diffs (Angular 16→21, kodality→termx-health rename, oversized refactored files) are not ported.
- Full analysis + Plan 1 detail: `~/.claude/plans/mossy-gathering-leaf.md`.
