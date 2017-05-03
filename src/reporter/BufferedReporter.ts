import { Reporter } from './Reporter';

abstract class BufferedReporter<T> extends Reporter {
  private timerId: number =  0;
  protected reportQueue: T[] = [];

  bufferReport(content) {
    const config = (<any>window).WEB_TRACKER.catcher;
    const merge = config.merge ? config.merge : true;
    const delay = config.delay < 0 ? 0 : config.delay;

    // Merge content or push content
    if (!merge) {
      this.reportQueue.push(content);
    } else {
      this._merge(content);
    }

    // Instant report
    if (delay <= 0) {
      this._report();
      return;
    } else {
      if (this.timerId) {
        return;
      }
      // Batch reporting
      this.timerId = setTimeout(() => {
        // Start reporting
        this._report();
        this.timerId = 0;
      }, delay);
    }
  }

  abstract _merge(..._);
  abstract _report(..._);
}

export default BufferedReporter;