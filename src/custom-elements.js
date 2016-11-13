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
import { patchDocument } from './patches/document'
import { patchWindow } from './patches/window'
import { patchConstructors } from './patches/constructors'

function checkSupport () {
  const name = `dummy-button-${Math.floor(Math.random() * 10000)}`

  const result = new Promise((resolve) => {

    const Dummy = class extends HTMLButtonElement {
      constructor () {
        super()
        resolve(true)
      }
    }

    window.customElements.define(name, Dummy, { extends: 'button' })

    const element = document.createElement('button', { is: name })

    if (!element instanceof Dummy) {
      resolve(false)
    }

    resolve(Promise.resolve(false))
  })

  return result.catch(() => false)
}

(() => {
  window.customElementsPolyfillReady = checkSupport()
    .then((isSupported) => {
      if (isSupported) {
        return
      }

      const registry = new CustomElementsRegistry()
      const observer = new TreeObserver(registry)

      patchDocument(registry)
      patchWindow(registry)
      patchConstructors(registry)

      observer.observe()
    })
})()
