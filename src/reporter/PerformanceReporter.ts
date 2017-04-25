import { Reporter } from './Reporter';
import { Metric } from '../metric/BaseMetric';

export interface MetricReportable {
  report(metric: Metric): void;
}

export default class PerformanceReporter extends Reporter implements MetricReportable {
  private endpoint: string = ``;

  report(metric: Metric): void {
    this.URLBuilder(metric);
    this.reportByImage(this.endpoint);
  }

}