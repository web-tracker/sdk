class ResourceTime {
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
  computeFirstMearningfulTime(): number;
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

/**
 * Base performance metric measurement.
 * Implements Navigation Timing API and Resource Timing API,
 * which are W3C standards. Otherwise implements polyfill for most of the browsers.
 *
 * Compatibility
 * http://caniuse.com/#feat=nav-timing
 */
export class BaseMetric implements Measurable {
  private timing: PerformanceTiming;
  private performanceAPI: Performance;

  constructor() {
    this.performanceAPI = window.performance;
    if (this.performanceAPI) {
      this.timing = this.performanceAPI.timing;
    }
  }

  /**
   * Polyfill for measuring first paint time.
   * The strategy is to use Timing API.
   * Compatibility: IE9+
   * @return {number}
   */
  public computeFirstPaintTime(): number {
    if (!this.timing) return -1;
    const firstPaintTime = this.timing.domLoading - this.timing.navigationStart;
    return firstPaintTime <= 0 ? -1 : firstPaintTime;
  }

  public computeFirstMearningfulTime(): number {
    throw new Error('Method not implemented.');
  }

  /**
   * Time to interact with DOM.
   * Measuring DOMReady time.
   */
  public computeFirstInteractionTime(): number {
    if (!this.timing) return -1;
    const interactionTime = this.timing.domInteractive - this.timing.navigationStart;
    return interactionTime <= 0 ? -1 : interactionTime;
  }

  /**
   * All resources loading time.
   * Measuring onload time.
   * @return {number}
   */
  public computeTotalLoadingTime(): number {
    if (!this.timing) return -1;
    const loadingTime = this.timing.loadEventEnd - this.timing.navigationStart;
    return loadingTime <= 0 ? -1 : loadingTime;
  }

  /**
   * Time to download all resources.
   * @return {number}
   */
  public computeTotalDownloadingTime(): number {
    if (!this.timing) return -1;
    const pageDownloadingTime = this.timing.responseEnd - this.timing.requestStart;
    return pageDownloadingTime <= 0 ? -1 : pageDownloadingTime;
  }

  /**
   * Computes resources loading time.
   * Calculate the average time of each resource type.
   * Compatibility: IE10+
   */
  public computeResourceTime(): ResourceTime {
    const resourcesTime = new ResourceTime();
    if (!this.performanceAPI) return resourcesTime;
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
      item.count += 1;
      item.duration += current.duration;
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
    const DOMparsingTime = this.timing.domComplete - this.timing.responseEnd;
    return DOMparsingTime <= 0 ? -1 : DOMparsingTime;
  }

  /**
   * Get DNS Lookup Time by using Timing API.
   * Note: the time might be 0 due to cache.
   * @return {number}
   */
  public computeDNSLookupTime(): number {
    if (!this.timing) return -1;
    const DNSTime = this.timing.domainLookupEnd - this.timing.domainLookupStart;
    return DNSTime <= 0 ? -1 : DNSTime;
  }

  /**
   * TTFB Definition.
   * https://en.wikipedia.org/wiki/Time_To_First_Byte
   * @return {number}
   */
  public computeFirstByteTime(): number {
    if (!this.timing) return -1;
    const firstByteTime = this.timing.responseStart - this.timing.navigationStart;
    return firstByteTime <= 0 ? -1 : firstByteTime;
  }
}