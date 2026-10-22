import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const mode = process.argv[2] ?? 'check';
if (!['check', 'build'].includes(mode)) throw new Error('Use check or build.');
const sdk = process.env.HOSHIKUZU_STUDIO_SDK;
if (!sdk || !fs.existsSync(path.resolve(sdk)) || !fs.statSync(path.resolve(sdk)).isFile()) {
  console.error('Set HOSHIKUZU_STUDIO_SDK to the index.ts entry of your separately obtained Studio SDK. The SDK is not included.');
  process.exitCode = 2;
} else {
  const config = path.join(root, 'node_modules', `.hoshikuzu-check-${process.pid}.json`);
  const run = (entry, args = []) => {
    const result = spawnSync(process.execPath, [entry, ...args], { cwd: root, stdio: 'inherit', env: process.env });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Project command failed (${result.status ?? result.signal}).`);
  };
  try {
    fs.writeFileSync(config, JSON.stringify({ extends: path.join(root, 'tsconfig.json'),
      compilerOptions: { paths: { '@avg-studio/sdk': [path.resolve(sdk)] } } }, null, 2));
    run(path.join(root, 'scripts/build-theme.mjs'));
    run(path.join(root, 'node_modules/typescript/lib/tsc.js'), ['--project', config]);
    if (mode === 'build') {
      run(path.join(root, 'node_modules/vite/bin/vite.js'), ['build']);
      const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
      const notices = [];
      const licenses = path.join(root, 'dist/LICENSES');
      fs.mkdirSync(licenses, { recursive: true });
      for (const [name, info] of Object.entries(lock.packages)) {
        if (!name.startsWith('node_modules/') || info.dev) continue;
        const folder = path.resolve(root, name);
        if (!folder.startsWith(path.join(root, 'node_modules') + path.sep)) throw new Error('Invalid dependency path.');
        if (!fs.existsSync(path.join(folder, 'package.json'))) continue;
        const pkg = JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf8'));
        const file = fs.readdirSync(folder).find(value => /^(?:license|licence|copying)(?:\.[a-z0-9]+)?$/i.test(value));
        if (!file) throw new Error(`Missing dependency license: ${pkg.name}`);
        const target = `${pkg.name.replace(/[^a-z0-9.-]/gi, '_')}-${pkg.version}.txt`;
        fs.copyFileSync(path.join(folder, file), path.join(licenses, target));
        notices.push({ name: pkg.name, version: pkg.version, license: pkg.license, file: `LICENSES/${target}` });
      }
      fs.writeFileSync(path.join(root, 'dist/THIRD_PARTY.json'), JSON.stringify(notices, null, 2) + '\n');
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    if (fs.existsSync(config)) fs.unlinkSync(config);
  }
}
