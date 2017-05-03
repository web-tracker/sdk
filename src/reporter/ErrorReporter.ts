import LZString from 'lz-string';
import { Error } from '../error/ErrorCatcher';
import { Environment } from '../detector/EnvironmentDetector';
import BufferedReporter from './BufferedReporter';

export default class ErrorReporter extends BufferedReporter<Error> {
  private endpoint: string = `//127.0.0.1:3000/error.gif`;

  constructor(private token: string, private environment: Environment) { super(); }

  report(error: Error): void {
    this.bufferReport(error);
  }

  _report() {
    LOG('Report Error:', this.reportQueue);
    const parameters = this.parameterBuilder(this.reportQueue);
    LOG('Error Parameters:', parameters);
    const url = this.URLBuilder(this.endpoint, parameters);
    this._compressError(this.reportQueue);
    return this.sendRequest(url);
  }

  private _compressError(reportQueue: Error[]) {
    for (const error of reportQueue) {
      error.stack = this._commpress(error.stack);
      error.message = this._commpress(error.message);
      error.scriptURI = this._commpress(error.scriptURI);
    }
  }

  /**
   * Make error stack compressed.
   */
  private _commpress(text: string): string {
    return LZString.compress(text);
  }

  /**
   * If there are already errors in the queue,
   * we just ignore this error.
   */
  _merge(error: Error) {
    const found = this.reportQueue.filter(
      errorInQueue => error.stack === errorInQueue.stack
    );
    if (found.length <= 0) {
      this.reportQueue.push(error);
    }
  }

  parameterBuilder(errors: Error[]) {
    let parameters = {};
    parameters['err'] = JSON.stringify(errors);
    // Should also carry token string
    parameters['token'] = this.token;

    // Combine environment infomation
    parameters['os'] = this.environment.operatingSystem._type.toLowerCase();
    parameters['br'] = this.environment.browser._type.toLowerCase();
    parameters['bv'] = this.environment.browser.version.toLowerCase();
    parameters['dc'] = this.environment.device.type;
    parameters['dv'] = this.environment.device.version;
    return parameters;
  }

}