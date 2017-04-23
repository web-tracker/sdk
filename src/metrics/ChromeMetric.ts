import { Measurable, BaseMetric } from './BaseMetric';

export default class ChromeMetric extends BaseMetric implements Measurable {
  computeFirstPaintTime() {
    const loadTimes = window['chrome'].loadTimes();
    const firstPaintTime = loadTimes.firstPaintTime;
    const startLoadTime = loadTimes.startLoadTime;
    return (firstPaintTime - startLoadTime) * 1000;
  }
}