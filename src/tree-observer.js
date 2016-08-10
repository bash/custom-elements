/**
 * (c) 2016 Ruben Schmidmeister
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
}
