import { BrowserType, Environment } from './Detector';
import ChromeMetric from './metrics/ChromeMetric';
export * from './Detector';

const env = new Environment();
const detected = env.detect();

function measure() {
  if (detected.browser.type === BrowserType.Chrome) {
    const metric = new ChromeMetric();
    const firstPaintTime = metric.computeFirstPaintTime();
    // if (firstPaintTime <= 0) {
    //   setTimeout(() => {
    //     measure();
    //   }, 200);
    //   return;
    // }
    LOG('Chrome first paint time:', firstPaintTime);
    const DNSLookupTime = metric.computeDNSLookupTime();
    LOG('DNSLookupTime:', DNSLookupTime);
    LOG('Load Event End', window.performance.timing.loadEventEnd);
    LOG('First Paint Time', window['chrome'].loadTimes().firstPaintTime);
    LOG(window.location.href);
  }
}
window.onload = measure;