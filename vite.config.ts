import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import lightningcss from 'vite-plugin-lightningcss';
// @ts-expect-error
import viteJoinMediaQueries from 'vite-join-media-queries';
import { patchCssModules } from 'vite-css-modules';

const metaUrl = import.meta.url;
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: '',
    sourcemap: false,
    minify: 'terser',
    cssMinify: 'lightningcss',
    terserOptions: {
      compress: {
        drop_console: ['log', 'time', 'timeEnd']
      },
      mangle: {
        properties: {
          regex: /_$/
        }
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
    viteJoinMediaQueries({
      paths2css: ['./dist']
    }),
    lightningcss(),
    patchCssModules(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', metaUrl)),
      'stores': fileURLToPath(new URL('./src/stores', metaUrl)),
    },
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer()
      ],
    },
  },
});

