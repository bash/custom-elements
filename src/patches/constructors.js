/*
 * Copyright (c) 2016 Ruben Schmidmeister <ruby@fog.im>
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details.
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
