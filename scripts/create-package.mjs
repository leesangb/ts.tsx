#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const templates = {
  vanilla: {
    'package.json': name => `{
  "name": "@tstsx/${name}",
  "version": "0.0.1",
  "description": "",
  "private": true,
  "license": "MIT",
  "type": "module",
  "author": "Sangbin Lee <leesangbin@outlook.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/leesangb/ts.tsx.git"
  },
  "files": ["dist"],
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.mjs"
      }
    }
  },
  "scripts": {
    "build": "tsc && vite build",
    "clean": "rm -rf .turbo dist",
    "dev": "vitest",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "catalog:core",
    "vite": "catalog:tools",
    "vite-plugin-dts": "catalog:tools",
    "vitest": "catalog:test"
  }
}`,
    'vite.config.ts': `import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
  },
});`,
    'src/index.ts': `// Export your package's public API here
`,
  },
  react: {
    'package.json': name => `{
  "name": "@tstsx/${name}",
  "version": "0.0.1",
  "description": "",
  "private": true,
  "license": "MIT",
  "type": "module",
  "author": "Sangbin Lee <leesangbin@outlook.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/leesangb/ts.tsx.git"
  },
  "files": ["dist"],
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.mjs"
      }
    }
  },
  "scripts": {
    "build": "tsc && vite build",
    "clean": "rm -rf .turbo dist",
    "dev": "vitest",
    "test": "vitest run"
  },
  "peerDependencies": {
    "react": "^18.0 || ^19.0",
    "react-dom": "^18.0 || ^19.0"
  },
  "devDependencies": {
    "@testing-library/dom": "catalog:test",
    "@testing-library/jest-dom": "catalog:test",
    "@testing-library/react": "catalog:test",
    "@testing-library/user-event": "catalog:test",
    "@types/react": "catalog:react18",
    "@types/react-dom": "catalog:react18",
    "@vitejs/plugin-react": "catalog:tools",
    "jsdom": "catalog:test",
    "typescript": "catalog:core",
    "vite": "catalog:tools",
    "vite-plugin-dts": "catalog:tools",
    "vitest": "catalog:test"
  }
}`,
    'vite.config.ts': `import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.build.json',
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});`,
    'src/index.ts': `// Export your package's public API here
`,
  },
  common: {
    'tsconfig.json': `{
  "extends": "../../../tsconfig.json",
  "include": ["src"]
}`,
    'tsconfig.build.json': `{
  "extends": "./tsconfig.json",
  "exclude": ["src/**/*.test.tsx", "src/**/*.test.ts", "src/test"]
}`,
    'vitest.config.ts': `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});`,
  },
};

async function updateTstsxPackage(scope, name) {
  const tstsxPath = join(__dirname, '..', 'packages', 'tstsx');

  // 1. Create @tstsx/src/[name].ts export file
  const exportFilePath = join(tstsxPath, 'src', `${name}.ts`);
  await writeFile(exportFilePath, `export * from '@tstsx/${name}';\n`);
  console.log(`  ✓ Created ${name}.ts in @tstsx/src`);

  // 2. Update @tstsx/package.json dependencies
  const packageJsonPath = join(tstsxPath, 'package.json');
  const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent);

  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }
  packageJson.dependencies[`@tstsx/${name}`] = 'workspace:*';

  // Sort dependencies alphabetically
  packageJson.dependencies = Object.fromEntries(
    Object.entries(packageJson.dependencies).sort(([a], [b]) => a.localeCompare(b)),
  );

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  console.log(`  ✓ Added @tstsx/${name} to @tstsx/package.json dependencies`);

  // 3. vite.config.ts는 자동으로 src/ 폴더를 읽어서 entry를 생성하므로 수정 불필요
  console.log(`  ✓ vite.config.ts will automatically detect ${name}.ts`);

  // 4. Update @tstsx/tsconfig.json paths
  const tstsxTsconfigPath = join(tstsxPath, 'tsconfig.json');
  const tstsxTsconfigContent = await readFile(tstsxTsconfigPath, 'utf-8');
  const tstsxTsconfig = JSON.parse(tstsxTsconfigContent);

  if (!tstsxTsconfig.compilerOptions.paths) {
    tstsxTsconfig.compilerOptions.paths = {};
  }
  tstsxTsconfig.compilerOptions.paths[`@tstsx/${name}`] = [`../${scope}/${name}/src`];

  // Sort paths alphabetically
  tstsxTsconfig.compilerOptions.paths = Object.fromEntries(
    Object.entries(tstsxTsconfig.compilerOptions.paths).sort(([a], [b]) => a.localeCompare(b)),
  );

  await writeFile(tstsxTsconfigPath, `${JSON.stringify(tstsxTsconfig, null, 2)}\n`);
  console.log(`  ✓ Added @tstsx/${name} to @tstsx/tsconfig.json paths`);

  // 5. Update root tsconfig.json paths
  const rootTsconfigPath = join(__dirname, '..', 'tsconfig.json');
  const rootTsconfigContent = await readFile(rootTsconfigPath, 'utf-8');
  const rootTsconfig = JSON.parse(rootTsconfigContent);

  if (!rootTsconfig.compilerOptions.paths) {
    rootTsconfig.compilerOptions.paths = {};
  }
  rootTsconfig.compilerOptions.paths[`@tstsx/${name}`] = [`./packages/${scope}/${name}/src`];

  // Sort paths alphabetically
  rootTsconfig.compilerOptions.paths = Object.fromEntries(
    Object.entries(rootTsconfig.compilerOptions.paths).sort(([a], [b]) => a.localeCompare(b)),
  );

  await writeFile(rootTsconfigPath, `${JSON.stringify(rootTsconfig, null, 2)}\n`);
  console.log(`  ✓ Added @tstsx/${name} to root tsconfig.json paths`);
}

async function createPackage(scope, name) {
  if (!templates[scope]) {
    console.error(`Invalid scope: ${scope}`);
    console.error(
      'Available scopes:',
      Object.keys(templates).filter(k => k !== 'common'),
    );
    process.exit(1);
  }

  const packagePath = join(__dirname, '..', 'packages', scope, name);

  // Create package directory and src folder
  await mkdir(packagePath, { recursive: true });
  await mkdir(join(packagePath, 'src'), { recursive: true });

  // Create scope-specific files
  const scopeFiles = templates[scope];
  for (const [filename, content] of Object.entries(scopeFiles)) {
    const fileContent = typeof content === 'function' ? content(name) : content;
    await writeFile(join(packagePath, filename), fileContent);
  }

  // Create common files
  for (const [filename, content] of Object.entries(templates.common)) {
    const fileContent = typeof content === 'function' ? content(name) : content;
    await writeFile(join(packagePath, filename), fileContent);
  }

  console.log(`✨ Created new ${scope} package @tstsx/${name} in packages/${scope}/${name}`);
  console.log(`\n🔗 Integrating with @tstsx package...`);

  await updateTstsxPackage(scope, name);

  console.log(`\n✅ Package created and integrated successfully!`);
  console.log(`\nNext steps:`);
  console.log(`  1. cd packages/${scope}/${name}`);
  console.log(`  2. Implement your package in src/`);
  console.log(`  3. Run pnpm install to update dependencies`);
  console.log(`  4. Run pnpm build to build your package`);
}

// Get scope and name from command line arguments
const [, , scope, name] = process.argv;

if (!scope || !name) {
  console.error('Usage: node create-package.mjs <scope> <name>');
  console.error('Example: node create-package.mjs vanilla my-package');
  console.error(
    'Available scopes:',
    Object.keys(templates).filter(k => k !== 'common'),
  );
  process.exit(1);
}

createPackage(scope, name).catch(console.error);
