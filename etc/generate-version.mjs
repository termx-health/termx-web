// Generates app/src/assets/base/version.json (served at /version.json) with build metadata,
// so a deployed web bundle can be traced back to an exact build. Values come from CI env
// (BUILD_TIME / GIT_COMMIT / PR_NUMBER) when present, otherwise fall back to git / now.
// Run from the `prebuild` npm hook, before `ng build`.
import {execSync} from 'node:child_process';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const git = (cmd) => {
  try {
    return execSync(cmd, {cwd: root, stdio: ['ignore', 'pipe', 'ignore']}).toString().trim();
  } catch {
    return '';
  }
};

const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const buildTime = process.env.BUILD_TIME || new Date().toISOString();
const commit = process.env.GIT_COMMIT || git('git rev-parse --short HEAD');
// On a merge to main the commit subject is "Merge pull request #NNN from ...".
let pr = process.env.PR_NUMBER || '';
if (!pr) {
  const match = git('git log -1 --pretty=%s').match(/#(\d+)/);
  pr = match ? match[1] : '';
}

const info = {version, buildTime, commit, pr};
const dir = join(root, 'app/src/assets/base');
mkdirSync(dir, {recursive: true});
writeFileSync(join(dir, 'version.json'), JSON.stringify(info, null, 2) + '\n');
console.log('Generated version.json:', info);
