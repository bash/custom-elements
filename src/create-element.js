/*
 * Copyright (c) 2016 Ruben Schmidmeister <ruby@fog.im>
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details.
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
