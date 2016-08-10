/**
 * (c) 2016 Ruben Schmidmeister
 */

// todo: cloning
// todo: upgrade/connect on insertion
// todo: disconnected on removal
// todo: patch createElementNS
// todo: adoptedCallback

import { CustomElementsRegistry } from './custom-elements-registry'
import { ElementConstructor } from './element-constructor'
import { createElement } from './create-element'

const registry = new CustomElementsRegistry()

Object.defineProperty(Window.prototype, 'customElements', {
  value: registry
})

const wrapElementConstructor = (Original) => {
  const proto = Original.prototype
  const Constructor = ElementConstructor(registry)
  
  Constructor.prototype = Object.create(proto)
  
  return Constructor
}

// todo: wrap all html element constructors
window.HTMLElement = wrapElementConstructor(window.HTMLElement)
window.HTMLInputElement = wrapElementConstructor(window.HTMLInputElement)

;(() => {
  const proto = window.HTMLDocument.prototype

  proto.createElement = createElement(proto.createElement, registry)
})()
