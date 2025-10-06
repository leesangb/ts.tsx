import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const srcFiles = readdirSync(resolve(__dirname, 'src'))
  .filter(file => file.endsWith('.ts'))
  .map(file => file.replace('.ts', ''));

const entry = Object.fromEntries(srcFiles.map(name => [name, resolve(__dirname, `src/${name}.ts`)]));

const external = ['react', 'react/jsx-runtime'];

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      rollupTypes: true,
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
