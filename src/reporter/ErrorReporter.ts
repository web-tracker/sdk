import { Error } from '../error/ErrorCatcher';
import { Environment } from '../detector/EnvironmentDetector';
import BufferedReporter from './BufferedReporter';

export default class ErrorReporter extends BufferedReporter<Error> {
    private endpoint: string = `//webtracker.dobest.me:3030/error.gif`;

    constructor(private token: string, private environment: Environment) { super(); }

    report(error: Error): void {
        this.bufferReport(error);
    }

    _report() {
        LOG('Report Error:', this.reportQueue);
        const parameters = this.parameterBuilder(this.reportQueue);
        LOG('Error Parameters:', parameters);
        const url = this.URLBuilder(this.endpoint, parameters);
        return this.sendRequest(url);
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
