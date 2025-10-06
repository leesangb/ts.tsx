import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = resolve(__dirname, '../packages/tstsx/src');
const packageJsonPath = resolve(__dirname, '../packages/tstsx/package.json');

const files = readdirSync(srcDir, { withFileTypes: true })
  .filter(dirent => dirent.isFile() && dirent.name.endsWith('.ts'))
  .map(dirent => dirent.name.replace('.ts', ''));

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const exports = {};
for (const file of files) {
  exports[`./${file}`] = {
    types: `./dist/${file}.d.ts`,
    import: `./dist/${file}.js`,
  };
}

packageJson.exports = exports;

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log('✓ Updated package.json exports:');
console.log(Object.keys(exports).join('\n'));
