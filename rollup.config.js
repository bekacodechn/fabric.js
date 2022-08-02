import { terser } from 'rollup-plugin-terser';
import ts from "rollup-plugin-ts";
import { parseClassDefaultProperties } from './rollup.plugin';
import json from '@rollup/plugin-json';

// rollup.config.js
export default {
  input: ['./index.js'],
  output: [
    {
      file: './dist/fabric.js',
      name: 'fabric',
      format: 'cjs',
    },
    Number(process.env.MINIFY) ?
      {
        file: './dist/fabric.min.js',
        format: 'cjs',
        name: 'fabric',
        plugins: [terser()],
      } :
      null,
  ],
  plugins: [
    json(),
    parseClassDefaultProperties(),
    ts({
      /* Plugin options */
    }),
  ]
};