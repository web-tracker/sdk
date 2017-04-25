import { Reportable, Reporter } from './Reporter';

export default class PerformanceReporter extends Reporter implements Reportable {
  // Browser might ignore requests with the same url
  private uniqueId: number = 0;
  private endpoint: string = ``;

  report(data: string): void {
    this.reportByImage(this.endpoint);
  }

  URLBuilder() {

  }
}