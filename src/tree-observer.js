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
  }

  /**
   * @todo observe shadow roots
   */
  observe () {
    const observer = new window.MutationObserver((mutations) => {
      const addedNodes = new Set()
      const removedNodes = new Set()

      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          this._attributeChange(mutation)
        }

        if (mutation.type === 'childList') {
          Array.from(mutation.addedNodes)
            .forEach((node) => this._addNode(node, addedNodes))

          Array.from(mutation.removedNodes)
            .forEach((node) => this._removeNode(node, removedNodes))
        }
      })
    })

    // noinspection JSCheckFunctionSignatures
    observer.observe(document, { childList: true, attributes: true, subtree: true, attributeOldValue: true })
  }

  /**
   *
   * @param {Node|Element} node
   * @param {Set<Element>} visitedNodes
   * @private
   * @todo elements inside shadow roots
   */
  _addNode (node, visitedNodes) {
    if (visitedNodes.has(node)) {
      return
    }

    if (node.nodeType !== window.Node.ELEMENT_NODE) {
      return
    }

    visitedNodes.add(node)

    const registry = this._registry

    for (let i = 0; i < node.childNodes.length; i++) {
      queueMicroTask(() => {
        this._addNode(node.childNodes[ i ], visitedNodes)
      })
    }

    if (isCustom(node)) {
      // noinspection JSAccessibilityCheck
      return registry._callbackReaction(node, 'connectedCallback', [])
    }

    // noinspection JSAccessibilityCheck
    registry._tryUpgradeElement(node)
  }

  /**
   *
   * @param {Node|Element} node
   * @param {Set<Element>} visitedNodes
   * @private
   */
  _removeNode (node, visitedNodes) {
    if (visitedNodes.has(node)) {
      return
    }

    if (node.nodeType !== window.Node.ELEMENT_NODE || !isCustom(node)) {
      return
    }

    visitedNodes.add(node)

    for (let i = 0; i < node.childNodes.length; i++) {
      queueMicroTask(() => {
        this._removeNode(node.childNodes[ i ], visitedNodes)
      })
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
