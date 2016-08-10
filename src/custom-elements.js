/**
 * (c) 2016 Ruben Schmidmeister
 */

import { CustomElementsRegistry } from './custom-elements-registry'
import { ElementConstructor } from './element-constructor'
import { createElement } from './create-element'

const registry = new CustomElementsRegistry()

window.customElements = registry

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
