import { BaseMetric, Measurable, ResourceTime } from './BaseMetric';

export default class SafariMetric extends BaseMetric implements Measurable {
  /**
   * Safari doesn't support getEntriesByType in performance timing API
   * @override
   * @return {number}
   */
   computeResourceTime(): ResourceTime {
     try {
       return super.computeResourceTime();
     } catch (error) {}
     return new ResourceTime();
   }
}