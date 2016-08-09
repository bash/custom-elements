/**
 * (c) 2016 Ruben Schmidmeister
 */

/**
 * @typedef {{}} CustomElementDefinition
 *
 * @property {string} name
 * @property {string} localName
 * @property {Function} constructor
 * @property {Object} prototype
 * @property {Array<string>} observedAttributes
 * @property {CustomElementLifeCycleCallbacks} lifecycleCallbacks
 */

/**
 * @typedef {{}} CustomElementLifeCycleCallbacks
 *
 * @property {Function} connectedCallback
 * @property {Function} disconnectedCallback
 * @property {Function} adoptedCallback
 * @property {Function} attributeChangedCallback
 */

/**
 *
 * @type {Array<string>}
 * @see https://www.w3.org/TR/custom-elements/#valid-custom-element-name
 */
const reservedNames = [
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph'
]

// const validNameRegex = /[a-z][\-.0-9a-z_\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*-[\-.0-9a-z_\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*$/
const validNameRegex = /[a-z][\-.0-9a-z_]*-[\-.0-9a-z_]*$/

/**
 *
 * @param {string} name
 * @returns {boolean}
 */
const isValidCustomElementName = (name) => {
  if (reservedNames.indexOf(name) !== -1) {
    return false
  }

  return validNameRegex.test(name)
}

export class CustomElementsRegistry {
  constructor () {
    this._names = new Set()
    this._constructors = new Set()

    /**
     *
     * @type {Map<string,CustomElementDefinition>}
     * @private
     */
    this._definitions = new Map()
  }

  /**
   *
   * @param {string} name
   * @param {Function} constructor
   * @param {{ extends: string }} [options]
   * @see https://www.w3.org/TR/custom-elements/#dom-customelementsregistry-define
   */
  define (name, constructor, options = {}) {
    name = name.toLowerCase()

    if (typeof constructor !== 'function') {
      throw new TypeError('constructor is not a constructor')
    }

    // todo: step 2.

    if (!isValidCustomElementName(name)) {
      throw new SyntaxError(`the element name ${name} is not valid`)
    }

    if (this._names.has(name)) {
      throw new Error(`an element with name '${name}' is already defined`)
    }

    if (this._constructors.has(constructor)) {
      throw new Error('this constructor is already registered')
    }

    let localName = name
    let _extends = options.extends || null

    if (_extends !== null) {
      if (isValidCustomElementName(_extends)) {
        throw new Error('extends must be a native element')
      }

      // todo: step 10.2.
      localName = _extends
    }

    const prototype = constructor.prototype

    if (typeof prototype !== 'object') {
      throw new TypeError('constructor.prototype must be an object')
    }

    const lifecycleCallbacks = {
      connectedCallback: null,
      disconnectedCallback: null,
      adoptedCallback: null,
      attributeChangedCallback: null
    }

    Object.keys(lifecycleCallbacks)
      .forEach((callbackName) => {
        const callbackValue = prototype[ callbackName ]

        if (callbackValue !== undefined) {
          lifecycleCallbacks[ callbackName ] = callbackValue
        }
      })

    let observedAttributes = []

    if (lifecycleCallbacks.attributeChangedCallback !== null) {
      const observedAttributesIterable = constructor.observedAttributes

      if (observedAttributesIterable != null) {
        observedAttributes = Array.from(observedAttributesIterable)
      }
    }

    const definition = {
      name,
      localName,
      constructor,
      prototype,
      observedAttributes,
      lifecycleCallbacks
    }

    this._definitions.set(name, definition)

    this._names.add(name)
    this._constructors.add(constructor)

    const document = window.document

    // todo: continue from step 17
  }
}
