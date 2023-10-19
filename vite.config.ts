import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import typescript from '@rollup/plugin-typescript';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  build: {
    lib: {
      fileName: 'index',
      entry: 'src/index.ts',
      formats: ['es'] as any,
    },
    rollupOptions: {
      output: {
        assetFileNames: assetInfo => {
          return assetInfo.name === 'style.css' ? 'index.css' : assetInfo.name!;
        },
      },
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-icons/md/index.js',
        'dashjs',
        'hls.js',
        'clsx',
      ],
    },
  },
  plugins: [
    {
      ...typescript(),
      apply: 'build',
    } as any,
    react({ jsxRuntime: 'classic' }),
  ],
}));
