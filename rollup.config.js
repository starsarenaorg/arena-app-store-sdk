import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import path from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

export default {
  input: 'src/index.ts',
  output: [
    {
      file: path.resolve(__dirname, 'dist', `arena-app-store-sdk-v${pkg.version}.js`),
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true
    },
    {
      file: path.resolve(__dirname, 'dist', 'arena-app-store-sdk.js'),
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true
    }
  ],
  plugins: [
    nodeResolve({
      preferBuiltins: false,
      browser: true
    }),
    commonjs(),
    json(),
    typescript(),
    terser()
  ],
  watch: {
    include: 'src/**'
  }
};
