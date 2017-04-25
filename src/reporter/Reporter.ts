export interface Reportable {
  report(data: string): void;
}

export class Reporter {
  private imageReporter = new Image();

  /**
   * Report by sending xhr request.
   */
  protected reportByAjax(url: string, data: string): void {}

  /**
   * Report by Image object.
   */
  protected reportByImage(url: string): Promise<string> {
    this.imageReporter.src = url;
    return new Promise<string>((resolve, reject) => {
      this.imageReporter.addEventListener('load', () => {
        resolve();
      }, false);
      this.imageReporter.addEventListener('error', () => {
        reject();
      });
    });
  }
}