#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const templates = {
  vanilla: {
    'package.json': (name) => `{
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
    "typescript": "^5.7.2",
    "vite": "^6.0.6",
    "vite-plugin-dts": "^4.4.0",
    "vitest": "^2.1.8"
  }
}`,
    'vite.config.ts': `import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/*.test.ts'],
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
    'package.json': (name) => `{
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
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "typescript": "^5.7.2",
    "vite": "^6.0.6",
    "vite-plugin-dts": "^4.4.0",
    "vitest": "^2.1.8"
  }
}`,
    'vite.config.ts': `import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['src/*.test.tsx', 'src/test', 'src/*.stories.tsx'],
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
  "extends": "../../../tsconfig.json"
}`,
    'vitest.config.ts': `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});`,
  },
};

async function createPackage(scope, name) {
  if (!templates[scope]) {
    console.error(`Invalid scope: ${scope}`);
    console.error('Available scopes:', Object.keys(templates).filter(k => k !== 'common'));
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
}

// Get scope and name from command line arguments
const [,, scope, name] = process.argv;

if (!scope || !name) {
  console.error('Usage: node create-package.mjs <scope> <name>');
  console.error('Example: node create-package.mjs vanilla my-package');
  console.error('Available scopes:', Object.keys(templates).filter(k => k !== 'common'));
  process.exit(1);
}

createPackage(scope, name).catch(console.error); 