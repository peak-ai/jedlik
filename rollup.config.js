import { eslint } from 'rollup-plugin-eslint';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: [
    { format: 'cjs', file: 'dist/index.js' },
    { format: 'esm', file: 'es/index.js' },
  ],
  external: ['aws-sdk', 'moment', '@babel/polyfill'],
  plugins: [
    eslint({
      throwOnError: true,
      throwOnWarning: true,
    }),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
