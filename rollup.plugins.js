const typescript = require('typescript');
const uglifyPlugin = require('rollup-plugin-uglify');
const resolvePlugin = require('rollup-plugin-node-resolve');
const commonjsPlugin = require('rollup-plugin-commonjs');
const typescriptPlugin = require('rollup-plugin-typescript');
const replacePlugin = require('rollup-plugin-replace');

const isDevMode = process.env.NODE_ENV === 'dev';
const plugins = [
  typescriptPlugin({ typescript: typescript }),
  resolvePlugin({
    jsnext: true,
    main: true,
    browser: true
  }),
  replacePlugin({
    // if in dev mode, log to console
    LOG: isDevMode ? 'console.log' : 'if (false)',
    __DEV__: isDevMode
  }),
  commonjsPlugin()
];

// Uglify code if in production env
if (!isDevMode) {
  plugins.push(uglifyPlugin());
}

module.exports = plugins;