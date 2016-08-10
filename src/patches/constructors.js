/**
 * (c) 2016 Ruben Schmidmeister
 */

import { ElementConstructor } from '../element-constructor'

/**
 *
 * @param {Function} Original
 * @param {CustomElementsRegistry} registry
 * @returns {Function}
 */
const wrapElementConstructor = (Original, registry) => {
  const proto = Original.prototype
  const Constructor = ElementConstructor(registry)

  Constructor.prototype = Object.create(proto)

  return Constructor
}

/**
 *
 * @param {CustomElementsRegistry} registry
 * @todo wrap all html element constructors
 */
export function patchConstructors (registry) {
  window.HTMLElement = wrapElementConstructor(window.HTMLElement, registry)
  window.HTMLInputElement = wrapElementConstructor(window.HTMLInputElement, registry)
}
