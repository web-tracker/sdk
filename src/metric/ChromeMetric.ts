import { Measurable, BaseMetric } from './BaseMetric';

export default class ChromeMetric extends BaseMetric implements Measurable {
  private loadTimes = window['chrome'].loadTimes();

  /**
   * Override parent's class by using Chrome's loadTimes method.
   * @override
   * @return {number}
   */
  computeFirstPaintTime(): number {
    const firstPaintTime = this.loadTimes.firstPaintTime;
    const startLoadTime = this.loadTimes.startLoadTime;
    // Somehow we cannot get first paint time,
    // we need to invoke parent's measuring strategy.
    if (firstPaintTime <= 0) {
      return super.computeFirstByteTime();
    }
    return (firstPaintTime - startLoadTime) * 1000;
  }
}