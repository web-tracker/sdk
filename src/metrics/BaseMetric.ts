export interface Measurable {
  computeFirstPaintTime();
}

/**
 * Base performance metric measurement class.
 */
export class BaseMetric implements Measurable {
  computeFirstPaintTime() {
    throw new Error('Method not implemented.');
  }
}