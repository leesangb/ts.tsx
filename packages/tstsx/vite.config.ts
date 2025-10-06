import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: {
        combined: resolve(__dirname, 'src/combined.ts'),
        'exception-boundary': resolve(__dirname, 'src/exception-boundary.ts'),
        init: resolve(__dirname, 'src/init.ts'),
        'stack-navigation': resolve(__dirname, 'src/stack-navigation.ts'),
        'object-diff': resolve(__dirname, 'src/object-diff.ts'),
        suspensify: resolve(__dirname, 'src/suspensify.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        '@tstsx/combined',
        '@tstsx/exception-boundary',
        '@tstsx/init',
        '@tstsx/stack-navigation',
        '@tstsx/object-diff',
        '@tstsx/suspensify',
      ],
    },
  },
});
