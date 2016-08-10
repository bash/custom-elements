/**
 * (c) 2016 Ruben Schmidmeister
 */

import { createElement } from '../create-element'

/**
 * 
 * @param {CustomElementsRegistry} registry
 */
export function patchDocument (registry) {
  const prototype = window.HTMLDocument.prototype

  prototype.createElement = createElement(prototype.createElement, registry)
}
