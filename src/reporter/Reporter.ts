export class Reporter {
  private imageReporter = new Image();

  /**
   * Report by Image object.
   * TODO: is there any compatibility issues?
   * TODO: do we need to handle error case?
   * @return {Promise<void>}
   */
  protected sendRequest(url: string): Promise<void> {
    this.imageReporter.src = url;
    return new Promise<void>((resolve, reject) => {
      const successCallback = () => {
        resolve();
        uninstallListeners();
      };
      const errorCallback = () => {
        reject();
        uninstallListeners();
      };
      this.imageReporter.addEventListener('load', successCallback, false);
      this.imageReporter.addEventListener('error', errorCallback, false);

      const uninstallListeners = () => {
        this.imageReporter.removeEventListener('load', successCallback, false);
        this.imageReporter.removeEventListener('error', errorCallback, false);
      };
    });
  }

  protected URLBuilder(endpoint: string, parameters: Object): string {
    if (!parameters) {
      throw new Error('Parameters can not be empty');
    }
    const timestamp = +new Date();
    const queries: string[] = [];
    for (const key of Object.keys(parameters)) {
      const value = parameters[key];
      if (value > 0 || value !== '-1') {
        queries.push(`${key}=${parameters[key]}`);
      }
    }
    const params = queries.join('&');
    const builtURL = `?${timestamp}&${params}`;
    return encodeURI(endpoint + builtURL);
  }
}