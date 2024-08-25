import {fileURLToPath, URL} from 'node:url';
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';

const metaUrl = import.meta.url;
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: '',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        booleans_as_integers: true,
      },
    }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-'),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', metaUrl)),
      'types': (
        `${fileURLToPath(new URL('./src/features/types', metaUrl))} ${
          fileURLToPath(new URL('./src/types', metaUrl))}
        `
      ),
      'stores': fileURLToPath(new URL('./src/features/stores', metaUrl)),
    },
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer({}) // add options if needed
      ],
    },
  },
});

