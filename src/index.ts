import { BrowserType, Environment } from './detector/BrowserDetector';
import { Measurable, BaseMetric } from './metric/BaseMetric';
import ChromeMetric from './metric/ChromeMetric';
import FirefoxMetric from './metric/FirefoxMetric';
import OperaMetric from './metric/OperaMetric';
import SafariMetric from './metric/SafariMetric';
import MSEdgeMetric from './metric/MSEdgeMetric';
import MSIEMetric from './metric/MSIEMetric';
import PerformanceReporter from './reporter/PerformanceReporter';

export * from './detector/BrowserDetector';

async function metricMeasuringStrategy() {
  let metricStrategy: Measurable;
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

  // Incorrect total loading time,
  // which means it's measured prematurely.
  if (totalLoadingTime <= 0) {
    LOG('Measured prematurely, retrying');
    metricMeasuringStrategy();
    return;
  }

  const firstPaintTime = metricStrategy.computeFirstPaintTime();
  const DNSLookupTime = metricStrategy.computeDNSLookupTime();
  const firstByteTime = metricStrategy.computeFirstByteTime();
  const firstInteractionTime = metricStrategy.computeFirstInteractionTime();
  const resourcesTime = metricStrategy.computeResourceTime();
  const totalDownloadingTime = metricStrategy.computeTotalDownloadingTime();
  const DOMParsingTime = metricStrategy.computeDOMParsingTime();

  LOG('DNSLookupTime:', DNSLookupTime);
  LOG('Total Loading Time:', totalLoadingTime);
  LOG('First Byte Time:', firstByteTime);
  LOG('First Paint Time', firstPaintTime);
  LOG('First Intercation Time', firstInteractionTime);
  LOG('Resource Time:', JSON.stringify(resourcesTime));
  LOG('Total Downloding Time:', totalDownloadingTime);
  LOG('DOM Parsing Time:', DOMParsingTime);

  const reporter = new PerformanceReporter();
  try {
    await reporter.report('');
  } catch (error) {
    // Reporting process may fail,
    // retry or report by other approach.
  }
}

// Start measuring after page loaded completely
window.addEventListener('load', () => {
  setTimeout(() => metricMeasuringStrategy());
});