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
  return function () {
    // noinspection JSAccessibilityCheck
    const definition = registry._lookupByConstructor(this.constructor)
    
    if (definition == null) {
      throw new Error('no definition found for element')
    }

    // todo: 3., 4.

    const constructionStack = definition.constructionStack
    const prototype = definition.prototype

    if (!constructionStack.length) {
      const element = document.createElement(definition.localName)

      Reflect.setPrototypeOf(element, prototype)

      // noinspection JSAccessibilityCheck
      registry._customElementState.set(element, 'custom')

      return element
    }

    const element = constructionStack[ constructionStack.length - 1 ]

    if (element === alreadyConstructedMarker) {
      throw new Error('invalid state e.g. nested element construction before calling super()')
    }

    Reflect.setPrototypeOf(element, prototype)

    // wtf is an already constructed marker?!?
    // is it really just a special object???
    constructionStack.pop()
    constructionStack.push(alreadyConstructedMarker)

    return element
  }
}
