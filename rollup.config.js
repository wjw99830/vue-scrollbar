import ts from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import vue from 'rollup-plugin-vue';
import pkg from './package.json';

export default {
  input: pkg.main,
  plugins: [
    commonjs(),
    ts({
      objectHashIgnoreUnknownHack: true,
      clean: true,
      useTsconfigDeclarationDir: true,
    }),
    vue(),
  ],
  output: [{
    file: pkg.module,
    format: 'es',
  }],
};
