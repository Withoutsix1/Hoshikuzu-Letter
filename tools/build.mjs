import { mkdir, copyFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const result = spawnSync(process.execPath, [
  fileURLToPath(new URL('node_modules/typescript/bin/tsc', root)),
], { cwd: fileURLToPath(root), stdio: 'inherit' });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

await mkdir(new URL('dist/ui-primitives/', root), { recursive: true });
await copyFile(new URL('src/ui-primitives/styles.css', root), new URL('dist/ui-primitives/styles.css', root));
