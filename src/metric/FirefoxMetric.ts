import { BaseMetric } from './BaseMetric';

export default class FirefoxMetric extends BaseMetric implements BaseMetric {
  computeFirstPaintTime() {
    throw new Error('Method not implemented.');
  }
}