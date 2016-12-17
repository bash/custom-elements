/*
 * Copyright (c) 2016 Ruben Schmidmeister <ruby@fog.im>
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details.
 */

// todo: cloning
// todo: patch createElementNS
// todo: adoptedCallback

import { CustomElementsRegistry } from './custom-elements-registry'
import { TreeObserver } from './tree-observer'
import { patchConstructors } from './patches/constructors'
import { checkSupport } from './support'
import { createElement } from './create-element'

(() => {
  if (checkSupport()) {
    return
  }

  const registry = new CustomElementsRegistry()
  const observer = new TreeObserver(registry)

  Object.defineProperty(window, 'customElements', {
    value: registry
  })

  const documentProto = window.HTMLDocument.prototype
  documentProto.createElement = createElement(documentProto.createElement, registry)

  patchConstructors(registry)

  observer.observe()
})()
