import { BaseMetric } from './BaseMetric';

export default class FirefoxMetric implements BaseMetric {
  computeFirstPaintTime(): void {
    throw new Error('Method not implemented.');
  }
}