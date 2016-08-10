/**
 * (c) 2016 Ruben Schmidmeister
 */

import { CustomElementsRegistry } from './custom-elements-registry'
import { ElementConstructor } from './element-constructor'

window.customElements = new CustomElementsRegistry()
window.HTMLElement = ElementConstructor
