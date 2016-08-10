/*
 * Copyright (c) 2016 Ruben Schmidmeister <ruby@fog.im>
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details.
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
