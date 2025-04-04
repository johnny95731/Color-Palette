import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import lightningcss from 'vite-plugin-lightningcss';
// @ts-expect-error
import viteJoinMediaQueries from 'vite-join-media-queries';
import { patchCssModules } from 'vite-css-modules';
import terserPlugin from './vite-terser-plugin';


const noHashFile = [
  'bootstrap-icons.woff2',
  'bootstrap-icons.woff'
];

const metaUrl = import.meta.url;
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: '',
    sourcemap: false,
    minify: false,
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        assetFileNames: function (file) {
          return noHashFile.includes(file.name!)
            ? '[name].[ext]'
            : '[name]-[hash].[ext]';
        },
      }
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
    terserPlugin(),
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

