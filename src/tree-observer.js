/*
 * Copyright (c) 2016 Ruben Schmidmeister <ruby@fog.im>
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details.
 */

import { isCustom, queueMicroTask } from './dom-utils'

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

    /**
     * 
     * @type {Set<Element>}
     * @private
     */
    this._connectedNodes = new Set()

    /**
     * 
     * @type {Set<Element>}
     * @private
     */
    this._disconnectedNodes = new Set()
  }

  /**
   * @todo observe shadow roots
   */
  observe () {
    const observer = new window.MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        Array.from(mutation.addedNodes)
          .forEach((node) => this._addNode(node))

        Array.from(mutation.removedNodes)
          .forEach((node) => this._removeNode(node))

        if (mutation.type === 'attributes') {
          this._attributeChange(mutation)
        }
      })

      this._connectedNodes = new Set()
      this._disconnectedNodes = new Set()
    })

    // noinspection JSCheckFunctionSignatures
    observer.observe(document, { childList: true, attributes: true, subtree: true, attributeOldValue: true })

    this._addNode(document.documentElement)
  }

  /**
   *
   * @param {Node|Element} node
   * @private
   * @todo elements inside shadow roots
   */
  _addNode (node) {
    if (node.nodeType !== window.Node.ELEMENT_NODE) {
      return
    }

    const registry = this._registry

    for (let i = 0; i < node.childNodes.length; i++) {
      queueMicroTask(() => {
        this._addNode(node.childNodes[ i ])
      })
    }

    if (this._connectedNodes.has(node)) {
      return
    }

    if (isCustom(node)) {
      this._connectedNodes.add(node)

      // noinspection JSAccessibilityCheck
      return registry._callbackReaction(node, 'connectedCallback', [])
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
    for (let i = 0; i < node.childNodes.length; i++) {
      queueMicroTask(() => {
        this._removeNode(node.childNodes[ i ])
      })
    }

    if (node.nodeType !== window.Node.ELEMENT_NODE || !isCustom(node)) {
      return
    }

    if (this._disconnectedNodes.has(node)) {
      return
    }

    this._disconnectedNodes.add(node)

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
