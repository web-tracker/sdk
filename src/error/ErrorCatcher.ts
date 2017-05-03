import ErrorReporter from '../reporter/ErrorReporter';

export interface Error {
  message: string;
  scriptURI: string;
  line: number;
  column: number;
  stack: string;
}

export default class ErrorCatcher {
  private historyErrors: Error[] = [];

  constructor(private reporter: ErrorReporter) {}

  install() {
    const onerror = window.onerror;
    window.onerror = (...args) => {
      // Invoke snapshot
      onerror && onerror.apply(null, args);
      const [errorMessage, scriptURI, lineNumber, columnNumber, errorObject] = args;
      this.packager(<Error>{
        message: errorMessage,
        scriptURI: scriptURI,
        line: lineNumber,
        column: columnNumber,
        stack: errorObject.stack
      });
    };

    // Surpress error to client console,
    // report to monitoring service instead.
    window.addEventListener('error', (event) => {
      event.preventDefault();
    });
  }

  /**
   * Make error message a packed report-ready object.
   */
  packager(error: Error) {
    const config = (<any>window).WEB_TRACKER.catcher;
    if (!config.enabled) {
      return;
    }
    const random = !config || config.random < 0 || config.random > 1 ? 1 : config.random;
    const allowRepeat = config.repeat < 0 ? 5 : config.repeat;
    const exclude = config.exclude || [];

    // Exclude
    for (const regex of exclude) {
      if (regex instanceof RegExp &&
          regex.test(error.message)
      ) {
        LOG('Error is exclued:', error.message);
        return;
      }
    }

    // Error is not selected to report
    if (Math.random() > random) {
      LOG('Error is not selected to report');
      return;
    }

    // How many times can it repeat?
    const repeatTimes = this.historyErrors.reduce((sum, historyError) => {
      return error.message === historyError.message &&
          error.line === historyError.line &&
          error.column === historyError.column &&
          error.stack === historyError.stack
        ? ++sum : sum;
    }, 0);

    // Repeat times of the same error exceed
    if (repeatTimes + 1 > allowRepeat) {
      LOG('Repeat too many times');
      return;
    }

    // Put into history queue
    this.historyErrors.push(error);

    // Put into reporting queue
    this.report(error);
  }

  report(error) {
    this.reporter.report(error);
  }
}