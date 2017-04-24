/**
 * Metric mesuaring methods.
 */
export interface Measurable {
  // Time to first paint
  computeFirstPaintTime();
  // Time to show up meaningful page
  computeFirstMearningfulTime();
  // Time to first interaction
  computeFirstInteractionTime();
  // Total loading time
  computeTotalLoadingTime();
  // Time to load resources
  computeResourceTime();
  // Time to parse DOM tree
  computeDOMParsingTime();
  // Time to look up DNS
  computeDNSLookupTime();
  // Time to first byte
  computeFirstByteTime();
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
  private performanceAPI = window.performance;
  private timing = this.performanceAPI.timing;

  /**
   * Polyfill for measuring first paint time.
   * The strategy is to use Timing API.
   * Compatibility: IE9+
   */
  computeFirstPaintTime() {
    const firstPaintTime = this.timing.domLoading - this.timing.navigationStart;
    return firstPaintTime <= 0 ? -1 : firstPaintTime;
  }
  computeFirstMearningfulTime() {
    throw new Error('Method not implemented.');
  }
  computeFirstInteractionTime() {
    throw new Error('Method not implemented.');
  }
  computeTotalLoadingTime() {
    const loadingTime = this.timing.loadEventEnd - this.timing.navigationStart;
    return loadingTime <= 0 ? -1 : loadingTime;
  }
  computeResourceTime() {
    throw new Error('Method not implemented.');
  }
  computeDOMParsingTime() {
    throw new Error('Method not implemented.');
  }

  /**
   * Get DNS Lookup Time by using Timing API.
   * Note: the time might be 0 due to cache.
   */
  computeDNSLookupTime() {
    const DNSTime = this.timing.domainLookupEnd - this.timing.domainLookupStart;
    return DNSTime <= 0 ? -1 : DNSTime;
  }

  /**
   * https://en.wikipedia.org/wiki/Time_To_First_Byte
   */
  computeFirstByteTime() {
    const firstByteTime = this.timing.responseStart - this.timing.navigationStart;
    return firstByteTime <= 0 ? -1 : firstByteTime;
  }
}