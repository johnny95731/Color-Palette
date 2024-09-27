import {fileURLToPath, URL} from 'node:url';
import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import lightningcss from 'vite-plugin-lightningcss';
import viteJoinMediaQueries from 'vite-join-media-queries';

const metaUrl = import.meta.url;
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: '',
    minify: 'terser',
    cssMinify: 'lightningcss',
    terserOptions: {
      compress: {
        booleans_as_integers: true,
        drop_console: ['log', 'time', 'timeEnd']
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
    lightningcss({
      // browserslist: '>= 0.25%',
    })
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
        autoprefixer()
      ],
    },
  },
});

