/**
 * (c) 2016 Ruben Schmidmeister
 */

import { CustomElementsRegistry } from './custom-elements-registry.js'

window.customElements = new CustomElementsRegistry()

class FooBar extends HTMLElement {
  constructor () {
    super()
  }

  connectedCallback () {
    console.log('connected', this)
  }

  disconnectedCallback () {
    console.log('connected')
  }

  attributeChangedCallback (name, oldValue, newValue) {
    console.log('attribute changed', name, oldValue, newValue)
  }

  static get observedAttributes () {
    return new Set(['foo', 'bar', 'baz'])
  }
}

window.customElements.define('foo-bar', FooBar)
