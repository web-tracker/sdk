import polyfill from './polyfill/polyfill';
import { BrowserType, Environment } from './detector/EnvironmentDetector';
import { BaseMetric } from './metric/BaseMetric';
import ChromeMetric from './metric/ChromeMetric';
import FirefoxMetric from './metric/FirefoxMetric';
import OperaMetric from './metric/OperaMetric';
import SafariMetric from './metric/SafariMetric';
import MSEdgeMetric from './metric/MSEdgeMetric';
import MSIEMetric from './metric/MSIEMetric';
import PerformanceReporter from './reporter/PerformanceReporter';
import ErrorCatcher from './error/ErrorCatcher';
import ErrorReporter from './reporter/ErrorReporter';

export * from './detector/EnvironmentDetector';

const _window: any = window;

if (__DEV__) {
  /**
   * Basic configuration should retrived from
   * server via Webtracker sdk.js file
   */
  _window.WEB_TRACKER = {
    token: 'token_string',
    metric: {
      enabled: true
    },
    catcher: {
      enabled: true,
      random: 1,    // 0-1
      repeat: 5,    // allow erorr repeat
      merge: true,    // merge errors
      delay: 1000,    // batch report
      exclude: [/^Script error.?/i]    // support regex
    }
  };
}

if (!_window.WEB_TRACKER) {
  throw new Error('No configuration for Web Tracker is found');
}

// Catch configuration file from global context
const config: any = _window.WEB_TRACKER;
const token = config.token;
let metricStrategy: BaseMetric;
const environment = new Environment().detect();

function metricMeasuringStrategy(polyfilled: boolean = false) {
  LOG('Current Browser:',
    environment.browser._type, environment.browser.version);
  switch (environment.browser.type) {
    case BrowserType.Chrome:
      metricStrategy = new ChromeMetric();
      break;
    case BrowserType.Firefox:
      metricStrategy = new FirefoxMetric();
      break;
    case BrowserType.Opera:
      metricStrategy = new OperaMetric();
      break;
    case BrowserType.Safari:
      metricStrategy = new SafariMetric();
      break;
    case BrowserType.MS_Edge:
      metricStrategy = new MSEdgeMetric();
      break;
    case BrowserType.MSIE:
      metricStrategy = new MSIEMetric();
      break;
    default:
      // Meet unexpected browser,
      // use basic measurement strategy.
      metricStrategy = new BaseMetric();
      break;
  }

  const totalLoadingTime = metricStrategy.computeTotalLoadingTime();
  metricStrategy.measure();

  // Incorrect total loading time,
  // which means it's measured prematurely.
  if (totalLoadingTime <= 0 && !polyfilled) {
    LOG('Measured prematurely, retrying');
    metricMeasuringStrategy();
    return;
  }

  LOG('\n============ PERFORMANCE METRIC START ============');
  LOG('DNSLookupTime:', metricStrategy.DNSLookupTime);
  LOG('Total Loading Time:', totalLoadingTime);
  LOG('First Byte Time:', metricStrategy.firstByteTime);
  LOG('First Paint Time', metricStrategy.firstPaintTime);
  LOG('First Intercation Time', metricStrategy.firstInteractionTime);
  LOG('Resource Time:', JSON.stringify(metricStrategy.computeResourceTime()));
  LOG('Total Downloding Time:', metricStrategy.downloadingTime);
  LOG('DOM Parsing Time:', metricStrategy.DOMParsingTime);

  const reporter = new PerformanceReporter(token, environment);
  const report = reporter.report(metricStrategy);
  if (__DEV__) {
    report.then(() => {
      LOG('============ PERFORMANCE METRIC END ============\n\n');
    });
  }
  report.catch(() => {
    LOG('Failed to report performance metrics');
  });
}

function installErrorCatcher() {
  const reporter = new ErrorReporter(token, environment);
  new ErrorCatcher(reporter).install();
}

// Start measuring after page loaded completely
window.addEventListener('load', () => {
  if (config.metric.enabled) {
    // if (__DEV__) _window.performance = undefined;
    let polyfilled = false;
    if (!_window.performance) {
      // Load polyfills
      polyfill(_window);
      polyfilled = true;
      LOG('Performance polyfill loaded');
    }
    setTimeout(() => metricMeasuringStrategy(polyfilled));
  }
  // Catcher starts after performance metric,
  // So that metric report process won't be stopped
  if (config.catcher.enabled) {
    installErrorCatcher();
  }
});
