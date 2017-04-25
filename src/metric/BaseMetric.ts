/**
 * Records time to download resources.
 */
export class ResourceTime {
  public img: number;
  public script: number;
  public link: number;
}

/**
 * Metric mesuaring methods.
 */
export interface Measurable {
  // Time to first paint
  computeFirstPaintTime(): number;
  // Time to show above the fold
  computeFirstMeaningfulTime(): number;
  // Time to first interaction
  computeFirstInteractionTime(): number;
  // Total loading time
  computeTotalLoadingTime(): number;
  // Total page downloading time
  computeTotalDownloadingTime(): number;
  // Time to load resources
  computeResourceTime(): ResourceTime;
  // Time to parse DOM tree
  computeDOMParsingTime(): number;
  // Time to look up DNS
  computeDNSLookupTime(): number;
  // Time to first byte
  computeFirstByteTime(): number;
}

export class Metric {
  firstPaintTime: number;
  firstMeaningfulTime: number;
  firstInteractionTime: number;
  totalLoadingTime: number;
  downloadingTime: number;
  DOMParsingTime: number;
  DNSLookupTime: number;
  firstByteTime: number;
  // Resources time
  imagesTime: number;
  stylesTime: number;
  scriptsTime: number;
}

/**
 * Base performance metric measurement.
 * Implements Navigation Timing API and Resource Timing API,
 * which are W3C standards. Otherwise implements polyfill for most of the browsers.
 *
 * Compatibility
 * http://caniuse.com/#feat=nav-timing
 */
export class BaseMetric extends Metric implements Measurable {
  private timing: PerformanceTiming;
  private performanceAPI: Performance;

  constructor() {
    super();
    this.performanceAPI = window.performance;
    if (this.performanceAPI) {
      this.timing = this.performanceAPI.timing;
    }
  }

  /**
   * Perform mesauring works.
   */
  public measure() {
    const resourcesTime = this.computeResourceTime();
    this.DNSLookupTime = this.computeDNSLookupTime();
    this.DOMParsingTime = this.computeDOMParsingTime();
    this.firstByteTime = this.computeFirstByteTime();
    this.firstInteractionTime = this.computeFirstInteractionTime();
    this.firstMeaningfulTime = this.computeFirstMeaningfulTime();
    this.firstPaintTime = this.computeFirstPaintTime();
    this.downloadingTime = this.computeTotalDownloadingTime();
    this.totalLoadingTime = this.computeTotalLoadingTime();
    this.imagesTime = resourcesTime.img;
    this.stylesTime = resourcesTime.link;
    this.scriptsTime = resourcesTime.script;
    return this;
  }

  /**
   * Polyfill for measuring first paint time.
   * The strategy is to use Timing API.
   * Compatibility: IE9+
   * @return {number}
   */
  public computeFirstPaintTime(): number {
    if (!this.timing) return -1;
    const firstPaintTime = Math.round(this.timing.domLoading - this.timing.navigationStart);
    return firstPaintTime <= 0 ? -1 : firstPaintTime;
  }

  public computeFirstMeaningfulTime(): number {
    return -1;
  }

  /**
   * Time to interact with DOM.
   * Measuring DOMReady time.
   * @return {number}
   */
  public computeFirstInteractionTime(): number {
    if (!this.timing) return -1;
    const interactionTime = Math.round(this.timing.domInteractive - this.timing.navigationStart);
    return interactionTime <= 0 ? -1 : interactionTime;
  }

  /**
   * All resources loading time.
   * Measuring onload time.
   * @return {number}
   */
  public computeTotalLoadingTime(): number {
    if (!this.timing) return -1;
    const loadingTime = Math.round(this.timing.loadEventEnd - this.timing.navigationStart);
    return loadingTime <= 0 ? -1 : loadingTime;
  }

  /**
   * Time to download all resources.
   * @return {number}
   */
  public computeTotalDownloadingTime(): number {
    if (!this.timing) return -1;
    const pageDownloadingTime = Math.round(this.timing.responseEnd - this.timing.requestStart);
    return pageDownloadingTime <= 0 ? -1 : pageDownloadingTime;
  }

  /**
   * Computes resources loading time.
   * Calculate the average time of each resource type.
   * Compatibility: IE10+
   * @return {ResourceTime}
   */
  public computeResourceTime(): ResourceTime {
    const resourcesTime = new ResourceTime();
    if (!this.performanceAPI || !this.performanceAPI.getEntriesByType) {
      return resourcesTime;
    }
    const resourcesItems = this.performanceAPI.getEntriesByType('resource');
    if (!resourcesItems || !(resourcesItems instanceof Array)) {
      return resourcesTime;
    }
    const resourceCounter = {
      img: { duration: 0, count: 0 },
      script: { duration: 0, count: 0 },
      link: { duration: 0, count: 0 }
    };
    const resourceMetric = resourcesItems.reduce((counter, current) => {
      const item = counter[current.initiatorType];
      if (item) {
        item.count += 1;
        item.duration += current.duration;
      }
      return counter;
    }, resourceCounter);
    resourcesTime.img = Math.round(resourceMetric.img.duration / resourceMetric.img.count);
    resourcesTime.script = Math.round(resourceMetric.script.duration / resourceMetric.script.count);
    resourcesTime.link = Math.round(resourceMetric.link.duration / resourceMetric.link.count);
    return resourcesTime;
  }

  /**
   * Compute the time to parse DOM tree.
   * @return {number}
   */
  public computeDOMParsingTime(): number {
    if (!this.timing) return -1;
    const DOMParsingTime = Math.round(this.timing.domComplete - this.timing.responseEnd);
    return DOMParsingTime <= 0 ? -1 : DOMParsingTime;
  }

  /**
   * Get DNS Lookup Time by using Timing API.
   * Note: the time might be 0 due to cache.
   * @return {number}
   */
  public computeDNSLookupTime(): number {
    if (!this.timing) return -1;
    const DNSTime = Math.round(this.timing.domainLookupEnd - this.timing.domainLookupStart);
    return DNSTime <= 0 ? -1 : DNSTime;
  }

  /**
   * TTFB Definition.
   * https://en.wikipedia.org/wiki/Time_To_First_Byte
   * @return {number}
   */
  public computeFirstByteTime(): number {
    if (!this.timing) return -1;
    const firstByteTime = Math.round(this.timing.responseStart - this.timing.navigationStart);
    return firstByteTime <= 0 ? -1 : firstByteTime;
  }
}