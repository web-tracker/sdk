/**
 * Get offset top of specific element.
 * @param {HTMLElement} element Element to be measured
 */
export function getOffsetTop(element: HTMLElement) {
  let offsetTop = element.offsetTop;
  const offsetParent = <HTMLElement>element.offsetParent;
  if (offsetParent) {
    offsetTop += getOffsetTop(offsetParent);
  }
  return offsetTop;
}