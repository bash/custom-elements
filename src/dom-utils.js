/*
 * Copyright (c) 2016 Ruben Schmidmeister <ruby@fog.im>
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details.
 */


/**
 *
 * @param {Function} callbackFn
 */
export function queueMicroTask(callbackFn) {
  Promise.resolve().then(callbackFn)
}

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
  return findNodeRoot(node).nodeType === window.Node.DOCUMENT_NODE
}

/**
 *
 * @param {Element|Node} element
 */
export function isCustom (element) {
  return window.customElements._getState(element) === 'custom'
}
