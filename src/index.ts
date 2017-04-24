import { BrowserType, Environment } from './detector';
import ChromeMetric from './metric/ChromeMetric';
import { Measurable, BaseMetric } from './metric/BaseMetric';
import FirefoxMetric from './metric/FirefoxMetric';
import OperaMetric from './metric/OperaMetric';
export * from './Detector';

const metricMeasuringStrategy = () => {
  let metricStrategy: Measurable;
  const environment = new Environment().detect();
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
    // Meet unexpected browser,
    // use basic measurement strategy.
    default:
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
};

// Start measuring after page loaded completely
window.addEventListener('load', () => {
  setTimeout(() => metricMeasuringStrategy());
});