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
  computeFistByteTime();
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
  computeFirstPaintTime() {
    throw new Error('Method not implemented.');
  }
  computeFirstMearningfulTime() {
    throw new Error('Method not implemented.');
  }
  computeFirstInteractionTime() {
    throw new Error('Method not implemented.');
  }
  computeTotalLoadingTime() {
    const performanceAPI = window.performance;
    if (!performanceAPI) {
      return -1;
    }
    const timing = performanceAPI.timing;
    const totalLoadingTime = timing.loadEventEnd - timing.navigationStart;
    return totalLoadingTime;
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
    const performanceAPI = window.performance;
    if (!performanceAPI) {
      return -1;
    }
    const timing = performanceAPI.timing;
    const DNSLookupTime = timing.domainLookupEnd - timing.domainLookupStart;
    return DNSLookupTime;
  }

  computeFistByteTime() {
    throw new Error('Method not implemented.');
  }
}