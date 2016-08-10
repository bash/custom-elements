/**
 * (c) 2016 Ruben Schmidmeister
 */

/**
 *
 * @param {CustomElementsRegistry} registry
 */
export function patchWindow (registry) {
  Object.defineProperty(Window.prototype, 'customElements', {
    value: registry
  })
}
