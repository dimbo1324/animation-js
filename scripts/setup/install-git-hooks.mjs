/**
 * Point git at the repository's tracked hooks and apply local safety
 * settings.
 *
 * Runs automatically from `npm install` via the `prepare` script, and can
 * be re-run at any time with `npm run hooks:install`.
 *
 * The hooks live in `.githooks/` and are tracked by git, so protection
 * travels with the repository instead of living in an untracked
 * `.git/hooks/`.
 */

import { chmodSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const HOOKS_DIR = '.githooks';

const LOCAL_CONFIG = [
  // Where git looks for hooks.
  ['core.hooksPath', HOOKS_DIR],
  // Refuse deletions and history rewrites pushed INTO this repository.
  ['receive.denyDeletes', 'true'],
  ['receive.denyNonFastForwards', 'true'],
  ['receive.denyDeleteCurrent', 'refuse'],
];

function git(args) {
  return spawnSync('git', args, { encoding: 'utf8' });
}

function isGitRepository() {
  const result = git(['rev-parse', '--git-dir']);

  return result.status === 0;
}

function applyConfig() {
  for (const [key, value] of LOCAL_CONFIG) {
    const result = git(['config', '--local', key, value]);

    if (result.status !== 0) {
      console.error(
        `hooks:install: failed to set ${key} — ${result.stderr.trim()}`,
      );
      process.exitCode = 1;
    }
  }
}

function makeHooksExecutable() {
  if (process.platform === 'win32') {
    return;
  }

  for (const name of readdirSync(HOOKS_DIR)) {
    chmodSync(path.join(HOOKS_DIR, name), 0o755);
  }
}

if (!isGitRepository()) {
  console.log('hooks:install: not a git repository, nothing to do.');
  process.exit(0);
}

if (!existsSync(HOOKS_DIR)) {
  console.error(`hooks:install: ${HOOKS_DIR}/ is missing.`);
  process.exit(1);
}

applyConfig();
makeHooksExecutable();

console.log(`hooks:install: git hooks active from ${HOOKS_DIR}/`);
console.log(
  'hooks:install: the `main` branch is protected from deletion.',
);
