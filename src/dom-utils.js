/**
 * (c) 2016 Ruben Schmidmeister
 */

/**
 *
 * @param {Node} node
 * @returns {Node}
 */
export function findNodeRoot (node) {
  if (node.parentNode == null) {
    return node
  }

  return findNodeRoot(node.parentNode)
}

/**
 *
 * @param {Node} node
 * @returns {Node}
 * @todo implement
 */
export function findShadowInclusiveRoot (node) {
  return findNodeRoot(node)
}

/**
 *
 * @param {Node} node
 * @returns {boolean}
 */
export function isConnected (node) {
  return findNodeRoot(node).nodeType === Node.DOCUMENT_NODE
}

/**
 * 
 * @param {Element} element
 */
export function isCustom (element) {
  return window.customElements._getState(element) === 'custom'
}
