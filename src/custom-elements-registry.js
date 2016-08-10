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
    /**
     *
     * @type {Set<string>}
     * @private
     */
    this._names = new Set()

    /**
     *
     * @type {Set<Function>}
     * @private
     */
    this._constructors = new Set()

    /**
     *
     * @type {Map<string,CustomElementDefinition>}
     * @private
     */
    this._definitions = new Map()

    /**
     *
     * @type {Map<string,{ resolve: (function()), promise: Promise }>}
     * @private
     */
    this._whenDefined = new Map()

    /**
     *
     * @type {WeakMap<Element,string>}
     * @private
     */
    this._customElementsState = new WeakMap()
  }

  /**
   *
   * @param {string} name
   * @returns {Function|undefined}
   */
  get (name) {
    if (this._definitions.has(name)) {
      return this._definitions.get(name).constructor
    }
  }

  /**
   *
   * @param {string} name
   */
  whenDefined (name) {
    if (!isValidCustomElementName(name)) {
      return Promise.reject(new SyntaxError(`the element name ${name} is not valid`))
    }

    if (this._definitions.has(name)) {
      return Promise.resolve()
    }

    const map = this._whenDefined

    if (!map.has(name)) {
      let resolver
      const promise = new Promise((resolve) => resolver = resolve)

      map.set(name, { promise, resolve: resolver })
    }

    const promise = map.get(name)

    return promise.promise
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

    // 1.
    if (typeof constructor !== 'function') {
      throw new TypeError('constructor is not a constructor')
    }

    // todo: 2.

    // 3.
    if (!isValidCustomElementName(name)) {
      throw new SyntaxError(`the element name ${name} is not valid`)
    }

    // 4.
    if (this._names.has(name)) {
      throw new Error(`an element with name '${name}' is already defined`)
    }

    // 6.
    if (this._constructors.has(constructor)) {
      throw new Error('this constructor is already registered')
    }

    // 8.
    let localName = name

    // 9. ('extends' is a keyword so we have to prefix it with an underscore)
    let _extends = options.extends || null

    // 10.
    if (_extends !== null) {
      // 10.1.
      if (isValidCustomElementName(_extends)) {
        throw new Error('extends must be a native element')
      }

      // todo: 10.2.
      // 10.3.
      localName = _extends
    }

    // omit the try catch because we don't respect 'being-defined' elements

    // 13.1.
    const prototype = constructor.prototype

    // 13.2.
    if (typeof prototype !== 'object') {
      throw new TypeError('constructor.prototype must be an object')
    }

    // 13.3.
    const lifecycleCallbacks = {
      connectedCallback: null,
      disconnectedCallback: null,
      adoptedCallback: null,
      attributeChangedCallback: null
    }

    // 13.4.
    Object.keys(lifecycleCallbacks)
      .forEach((callbackName) => {
        // 13.4.1.
        const callbackValue = prototype[ callbackName ]

        // 13.4.2.
        if (callbackValue !== undefined) {
          lifecycleCallbacks[ callbackName ] = callbackValue
        }
      })

    // 13.5.
    let observedAttributes = []

    // 13.6.
    if (lifecycleCallbacks.attributeChangedCallback !== null) {
      // 13.6.1.
      const observedAttributesIterable = constructor.observedAttributes

      // 13.6.2.
      if (observedAttributesIterable != null) {
        // todo: is converting to strings necessary?
        observedAttributes = Array.from(observedAttributesIterable)
          .map((attr) => String(attr))
      }
    }

    // 14.
    const definition = {
      name,
      localName,
      constructor,
      prototype,
      observedAttributes,
      lifecycleCallbacks
    }

    // 15.
    this._definitions.set(name, definition)

    this._names.add(name)
    this._constructors.add(constructor)

    // 16.
    const document = window.document

    // 17.
    let selector = localName

    if (_extends != null) {
      selector += `[is="${name}"]`
    }

    // todo: how do i find those elements in the shadow root?
    const upgradeCandidates = document.querySelectorAll(selector)

    // 18.
    Array.from(upgradeCandidates)
      .forEach((element) => this._upgradeElement(element, definition))

    // 19.
    if (this._whenDefined.has(name)) {
      // 19.1.
      const promise = this._whenDefined.get(name)

      // 19.2.
      promise.resolve()

      // 19.3.
      this._whenDefined.delete(name)
    }
  }

  /**
   *
   * @param {Element} element
   * @param {CustomElementDefinition} definition
   * @private
   * @see https://www.w3.org/TR/custom-elements/#upgrades
   */
  _upgradeElement (element, definition) {
    const state = this._customElementsState.get(element)

    // 1.
    if (state === 'custom') {
      return
    }

    // 2.
    if (state === 'failed') {
      return
    }

    // todo: 3.

    if (element.ownerDocument) {
      
    }
  }
}
