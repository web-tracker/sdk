import { BrowserType, Environment } from './Detector';
import ChromeMetric from './metric/ChromeMetric';
import { Measurable, BaseMetric } from './metric/BaseMetric';
import FirefoxMetric from './metric/FirefoxMetric';
import OperaMetric from './metric/OperaMetric';
export * from './Detector';

function metricMeasuringStrategy() {
  let metricStrategy: Measurable;
  const environment = (new Environment()).detect();
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
    // Meet unexpected Browser,
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

  // DNS Lookup Time
  const DNSLookupTime = metricStrategy.computeDNSLookupTime();

  LOG('DNSLookupTime:', DNSLookupTime);
  LOG('Total Loading Time:', totalLoadingTime);
}

// Start measuring after page loaded completely
window.addEventListener('load', () => {
  setTimeout(() => metricMeasuringStrategy());
});