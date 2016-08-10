/**
 * (c) 2016 Ruben Schmidmeister
 */

/**
 *
 * @param {Function} createElement
 * @param {CustomElementsRegistry} registry
 * @returns {function()}
 */
export function createElement (createElement, registry) {
  /**
   *
   * @param {string} localName
   * @param {{ is: string|null }} options
   */
  return function (localName, options = {}) {
    const element = createElement.call(this, localName)
    
    if (options.is != null) {
      element.setAttribute('is', options.is)
    }

    // noinspection JSAccessibilityCheck
    const definition = registry._getElementDefinition(element)

    if (definition != null) {
      // noinspection JSAccessibilityCheck
      registry._upgradeElement(element, definition)
    }

    return element
  }
}
