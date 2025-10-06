import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const srcFiles = readdirSync(resolve(__dirname, 'src'))
  .filter(file => file.endsWith('.ts'))
  .map(file => file.replace('.ts', ''));

const entry = Object.fromEntries(srcFiles.map(name => [name, resolve(__dirname, `src/${name}.ts`)]));

const external = ['react', 'react/jsx-runtime', ...srcFiles.map(name => `@tstsx/${name}`)];

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry,
      formats: ['es'],
    },
    rollupOptions: {
      external,
    },
  },
});
