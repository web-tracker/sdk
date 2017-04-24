let browsers = null;
const argv = process.argv;
const presetBrowser = ['PhantomJS', 'Chrome', 'Firefox', 'Opera'];
const devBrowser = argv[argv.length - 1].substring(2);
const isDevMode = process.env.NODE_ENV === 'dev';
if (isDevMode) {
  browsers = presetBrowser.filter(preset =>
    preset.toLowerCase() === devBrowser.toLowerCase()
  );
} else {
  // Temporarily using PhantomJS to test
  browsers = [presetBrowser[0]];
}
module.exports = function(config) {
  config.set({
    files: [
      'src/index.ts',
      'test/**/*.js',
      // Added for file watch
      { pattern: 'src/**/*.ts', included: false }
    ],
    exclude: [
      'src/types.d.ts'
    ],
    frameworks: ['jasmine'],
    browsers: browsers,
    reporters: ['mocha'],
    captureConsole: true,
    loggers: [{type: 'console'}],
    logLevel: config.LOG_DEBUG,
    preprocessors: {
      'src/**/*.ts': ['rollup', 'transformPath', 'inject-html']
    },
    rollupPreprocessor: {
      plugins: require('./rollup.plugins'),
      format: 'iife',
      moduleName: 'WebTracker',
      sourceMap: true
    },
    transformPathPreprocessor: {
      transformer: function(path) {
        return path.replace(/\index.ts$/, 'sdk.js')
      }
    },
    injectHtml: {
      file: 'test/test.html'
    },
    plugins: [
      'karma-jasmine',
      'karma-inject-html',
      'karma-mocha-reporter',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher',
      'karma-rollup-preprocessor',
      'karma-transform-path-preprocessor',
    ],
    autoWatch: true,
    singleRun: !isDevMode
  });
};