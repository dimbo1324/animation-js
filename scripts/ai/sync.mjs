/**
 * Cross-platform launcher for the rule-sync script.
 *
 * The generator itself is Python (`scripts/ai/sync_agents.py`). This shim
 * finds a working interpreter so that `npm run ai:sync` behaves the same
 * on Windows, macOS, and Linux, and fails with a readable message instead
 * of a spawn error when Python is missing.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GENERATOR = path.join(HERE, 'sync_agents.py');

const CANDIDATES =
  process.platform === 'win32'
    ? ['python', 'py', 'python3']
    : ['python3', 'python'];

const args = process.argv.slice(2);

for (const interpreter of CANDIDATES) {
  // No `shell: true` on purpose: a shell turns "command not found" into a
  // generic non-zero exit, which would stop the fallback chain.
  const result = spawnSync(interpreter, [GENERATOR, ...args], {
    stdio: 'inherit',
  });

  if (result.error?.code === 'ENOENT') {
    continue;
  }

  if (result.status === null) {
    console.error(`ai-sync: ${interpreter} terminated unexpectedly`);
    process.exit(1);
  }

  process.exit(result.status);
}

console.error(
  'ai-sync: no Python interpreter found. Install Python 3.10+ and make '
    + `sure one of [${CANDIDATES.join(', ')}] is on PATH.`,
);
process.exit(1);
