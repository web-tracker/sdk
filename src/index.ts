import { BrowserType, Environment } from './detector/EnvironmentDetector';
import { BaseMetric } from './metric/BaseMetric';
import ChromeMetric from './metric/ChromeMetric';
import FirefoxMetric from './metric/FirefoxMetric';
import OperaMetric from './metric/OperaMetric';
import SafariMetric from './metric/SafariMetric';
import MSEdgeMetric from './metric/MSEdgeMetric';
import MSIEMetric from './metric/MSIEMetric';
import PerformanceReporter from './reporter/PerformanceReporter';

export * from './detector/EnvironmentDetector';

function metricMeasuringStrategy() {
  let metricStrategy: BaseMetric;
  const environment = new Environment().detect();
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
  if (totalLoadingTime <= 0) {
    LOG('Measured prematurely, retrying');
    metricMeasuringStrategy();
    return;
  }

  LOG('DNSLookupTime:', metricStrategy.DNSLookupTime);
  LOG('Total Loading Time:', totalLoadingTime);
  LOG('First Byte Time:', metricStrategy.firstByteTime);
  LOG('First Paint Time', metricStrategy.firstPaintTime);
  LOG('First Intercation Time', metricStrategy.firstInteractionTime);
  LOG('Resource Time:', JSON.stringify(metricStrategy.computeResourceTime()));
  LOG('Total Downloding Time:', metricStrategy.downloadingTime);
  LOG('DOM Parsing Time:', metricStrategy.DOMParsingTime);

  const reporter = new PerformanceReporter();
  reporter.report(environment, metricStrategy).catch(() => {
    LOG('Failed to report performance metrics');
  });
}

// Start measuring after page loaded completely
window.addEventListener('load', () => {
  setTimeout(() => metricMeasuringStrategy());
});