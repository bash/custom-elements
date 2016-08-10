/**
 * (c) 2016 Ruben Schmidmeister
 */

// todo: cloning
// todo: patch createElementNS
// todo: adoptedCallback
// todo: attributeChangedCallback

import { CustomElementsRegistry } from './custom-elements-registry'
import { TreeObserver } from './tree-observer'

import { patchDocument } from './patches/document'
import { patchWindow } from './patches/window'
import { patchConstructors } from './patches/constructors'

const registry = new CustomElementsRegistry()
const observer = new TreeObserver(registry)

patchDocument(registry)
patchWindow(registry)
patchConstructors(registry)

observer.observe()
