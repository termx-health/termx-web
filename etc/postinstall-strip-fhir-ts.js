#!/usr/bin/env node
/**
 * Strip the .ts source files shipped by the `fhir` npm package's `model/` directory.
 *
 * `fhir@4.12.0` ships both `model/*.ts` (source) and `model/*.d.ts` (declarations) — the
 * package author's `files` glob in their package.json is `["model/", …]` which sweeps in
 * everything. TypeScript prefers `.ts` over `.d.ts` for module resolution, and the package's
 * internal `validator.d.ts` / `parseConformance.d.ts` transitively reference `./model/parsed-*`
 * — which TS then resolves to the `.ts` source files and "compiles" them. Since nothing in our
 * app uses those `parsed-*` interfaces directly, TS warns:
 *
 *     Warning: node_modules/fhir/model/parsed-concept.ts is part of the TypeScript compilation
 *              but it's unused.
 *
 * (Cropping up on every `npm start` since the Angular 21 upgrade.)
 *
 * Project-side `tsconfig.app.json#exclude` doesn't help — `exclude` filters files matched by
 * `include`, not files pulled in via TS module resolution. `paths` re-mapping doesn't help
 * either — the offending imports are relative paths INSIDE the fhir package. The clean fix is
 * to physically remove the `.ts` siblings; `.d.ts` files are byte-equivalent (pure-type
 * interfaces, zero runtime code), so TS resolution falls back to them cleanly and our
 * `import {Bundle} from 'fhir/model/bundle'` etc. continue to type-check.
 *
 * Runs on every `npm install` via the package.json `postinstall` hook. Idempotent and silent
 * on missing files (so reinstalls of a different fhir version, or future versions that fix
 * this upstream, don't break).
 */
const fs = require('fs');
const path = require('path');

const modelDir = path.join(__dirname, '..', 'node_modules', 'fhir', 'model');
if (!fs.existsSync(modelDir)) {
  process.exit(0);
}

let removed = 0;
for (const entry of fs.readdirSync(modelDir)) {
  // Drop .ts source files; keep .d.ts (declarations), .js (runtime), .js.map (source maps).
  if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
    fs.rmSync(path.join(modelDir, entry));
    removed++;
  }
}
if (removed > 0) {
  console.log(`[postinstall] stripped ${removed} unused .ts file(s) from node_modules/fhir/model/`);
}
