import ts from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import vue from 'rollup-plugin-vue';
import pkg from './package.json';
import css from 'rollup-plugin-css-only';

export default {
  input: 'src/install.ts',
  plugins: [
    css({ output: 'dist/style.css' }),
    commonjs(),
    ts({
      objectHashIgnoreUnknownHack: true,
      clean: true,
      useTsconfigDeclarationDir: true
    }),
    vue({ css: false })
  ],
  output: [{
    file: pkg.module,
    format: 'es'
  }]
};
