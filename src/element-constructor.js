/*
 * Copyright (c) 2016 Ruben Schmidmeister <ruby@fog.im>
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details.
 */

const alreadyConstructedMarker = {}

/**
 *
 * @param {CustomElementsRegistry} registry
 * @returns {Function}
 * @constructor
 */
export function ElementConstructor (registry) {
  return function Constructor () {
    const proto = Object.getPrototypeOf(this)

    if (proto === Constructor.prototype) {
      throw new TypeError('Illegal Constructor')
    }

    // 3.
    // noinspection JSAccessibilityCheck
    const definition = registry._lookupByConstructor(this.constructor)

    if (definition == null) {
      throw new Error('no definition found for element')
    }

    // 4.
    // if (definition.localName === definition.name && Object.getPrototypeOf(proto) !== Constructor.prototype) {
    //   throw new TypeError('an autonomous element must inherit from HTMLElement')
    // }

    // todo: 5.

    const constructionStack = definition.constructionStack
    // 6.
    const prototype = definition.prototype

    // 7.
    if (!constructionStack.length) {
      // 7.1
      const element = document.createElement(definition.localName)

      // 7.2
      Reflect.setPrototypeOf(element, prototype)

      // 7.3
      // noinspection JSAccessibilityCheck
      registry._customElementState.set(element, 'custom')

      // TODO: 7.4

      // 7.5
      return element
    }

    // 8.
    const element = constructionStack[ constructionStack.length - 1 ]

    // 9.
    if (element === alreadyConstructedMarker) {
      throw new Error('invalid state e.g. nested element construction before calling super()')
    }

    // 10.
    Reflect.setPrototypeOf(element, prototype)

    // 11.
    constructionStack[ constructionStack.length - 1 ] = alreadyConstructedMarker

    // 12.
    return element
  }
}
