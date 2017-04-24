const isDev = process.env.NODE_ENV === 'dev';

export default {
  entry: 'src/index.ts',
  dest: 'lib/sdk.js',
  moduleName: 'WebTracker',
  format: 'iife',
  sourceMap: true,
  plugins: require('./rollup.plugins')
};