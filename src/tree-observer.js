/*
 * Copyright (c) 2016 Ruben Schmidmeister <ruby@fog.im>
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details.
 */

import { isCustom } from './dom-utils'

export class TreeObserver {
  /**
   *
   * @param {CustomElementsRegistry} registry
   */
  constructor (registry) {
    /**
     *
     * @type {CustomElementsRegistry}
     * @private
     */
    this._registry = registry
  }

  /**
   * @todo observe shadow roots
   */
  observe () {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        Array.from(mutation.addedNodes)
          .forEach((node) => this._addNode(node))

        Array.from(mutation.removedNodes)
          .forEach((node) => this._removeNode(node))

        if (mutation.type === 'attributes') {
          this._attributeChange(mutation)
        }
      })
    })

    // noinspection JSCheckFunctionSignatures
    observer.observe(document, { childList: true, attributes: true, subtree: true, attributeOldValue: true })
  }

  /**
   *
   * @param {Node|Element} node
   * @private
   */
  _addNode (node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return
    }

    const registry = this._registry

    if (isCustom(node)) {
      // noinspection JSAccessibilityCheck
      registry._callbackReaction(node, 'connectedCallback', [])
    }

    // noinspection JSAccessibilityCheck
    registry._tryUpgradeElement(node)
  }

  /**
   *
   * @param {Node|Element} node
   * @private
   */
  _removeNode (node) {
    if (node.nodeType !== Node.ELEMENT_NODE || !isCustom(node)) {
      return
    }

    // noinspection JSAccessibilityCheck
    this._registry._callbackReaction(node, 'disconnectedCallback', [])
  }

  /**
   *
   * @param {MutationRecord} mutation
   * @private
   */
  _attributeChange (mutation) {
    const node = mutation.target

    if (!isCustom(node)) {
      return
    }
    
    const attributeName = mutation.attributeName

    // noinspection JSAccessibilityCheck
    this._registry._callbackReaction(node, 'attributeChangedCallback', [
      attributeName,
      mutation.oldValue,
      node.getAttribute(attributeName),
      mutation.attributeNamespace
    ])
  }
}
