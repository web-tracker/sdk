export type ParameterMap = {
  key: string;
  value: string;
};

export class Reporter {
  private imageReporter = new Image();

  // Browser might ignore requests with the same url
  private uniqueId: number = 0;

  /**
   * Report by sending xhr request.
   */
  protected reportByAjax(url: string, data: string): void {}

  /**
   * Report by Image object.
   * @return {Promise<void>}
   */
  protected reportByImage(url: string): Promise<void> {
    this.imageReporter.src = url;
    return new Promise<void>((resolve, reject) => {
      const successCallback = () => {
        resolve();
        this.imageReporter.removeEventListener('load', successCallback, false);
      };
      const errorCallback = () => {
        reject();
        this.imageReporter.removeEventListener('error', errorCallback, false);
      };
      this.imageReporter.addEventListener('load', successCallback, false);
      this.imageReporter.addEventListener('error', errorCallback, false);
    });
  }

  // Todo
  protected URLBuilder(parameters: ParameterMap[]) {
    const queries: string[] = [];
    for (const param of parameters) {
      queries.push(`${param.key}=${param.value}`);
    }
    const params = queries.join('&');
    const builtURL = `?${this.uniqueId++}&${params}`;
    return encodeURIComponent(builtURL);
  }
}