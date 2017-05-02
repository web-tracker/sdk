import { Reporter } from './Reporter';
import { Metric } from '../metric/BaseMetric';
import { Environment } from '../index';

const parameterMapper = {
  firstPaintTime: 'fp',
  firstByteTime: 'fb',
  firstMeaningfulTime: 'fm',
  firstInteractionTime: 'fi',
  totalLoadingTime: 'tl',
  downloadingTime: 'dl',
  DOMParsingTime: 'dp',
  DNSLookupTime: 'du',
  imagesTime: 'im',
  stylesTime: 'ss',
  scriptsTime: 'sc'
};

export default class PerformanceReporter extends Reporter {
  private endpoint: string = `//127.0.0.1:3000/perf.gif`;

  report(token: string, environment: Environment, metric: Metric): Promise<void> {
    const parameters = this.parameterBuilder(token, environment, metric);
    const url = this.URLBuilder(this.endpoint, parameters);
    LOG('Combined parameters:', parameters);
    LOG('Report to url:', url);
    return this.sendRequest(url);
  }

  private parameterBuilder(token: string, environment: Environment, metric: Metric) {
    const parameters = {};
    const keys = Object.keys(metric);
    for (const key of keys) {
      const value = metric[key];
      const alias = parameterMapper[key];
      // Filtering invalid metric data
      if (value && alias && !isNaN(value) && value !== -1) {
        parameters[alias] = value;
      }
    }

    // Should also carry token string
    parameters['token'] = token;

    // Combine environment infomation
    parameters['os'] = environment.operatingSystem._type.toLowerCase();
    parameters['br'] = environment.browser._type.toLowerCase();
    parameters['bv'] = environment.browser.version.toLowerCase();
    parameters['dc'] = environment.device.type;
    parameters['dv'] = environment.device.version;
    return parameters;
  }

}