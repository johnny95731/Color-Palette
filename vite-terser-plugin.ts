import * as fs  from 'fs';
import { minify } from 'terser';
import type { PluginOption } from 'vite';
import type { MinifyOptions } from 'terser';

const options_ = {
  compress: {
    drop_console: ['log', 'time', 'timeEnd'],
    toplevel: true,
  },
  mangle: {
    toplevel: true,
    properties: {
      regex: /_$/
    }
  },
  nameCache: {}
} satisfies MinifyOptions;


export default (
  outDir = ['./dist'],
  options: MinifyOptions = JSON.parse(JSON.stringify(options_))
) => ({
  name: 'terser',
  enforce: 'post',
  apply: 'build',
  closeBundle: {
    order: 'post',
    sequential: true,
    async handler() {
      for (const path of outDir) {
        const files = fs.readdirSync(path)
          .filter((filename) => /\.js$/.test(filename));
        for (const filename of files) {
          const filePath = `${path}/${filename}`;
          const code = fs.readFileSync(filePath, 'utf-8');
          const result = await minify(code, options);
          if (result.code) fs.writeFileSync(filePath, result.code, 'utf8');
        }
      }
    },
  },
} satisfies PluginOption);
