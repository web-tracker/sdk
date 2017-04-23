import { Measurable, BaseMetric } from './BaseMetric';

export default class ChromeMetric extends BaseMetric implements Measurable {
  computeFirstPaintTime() {
    throw new Error('Method not implemented.');
  }
}