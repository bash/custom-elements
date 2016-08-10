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
 * @typedef {{}} CustomElementDefinition
 *
 * @property {string} name
 * @property {string} localName
 * @property {Function} constructor
 * @property {Object} prototype
 * @property {Array<string>} observedAttributes
 * @property {CustomElementLifeCycleCallbacks} lifecycleCallbacks
 * @property {Array} constructionStack
 */

/**
 * @typedef {{}} CustomElementLifeCycleCallbacks
 *
 * @property {Function} connectedCallback
 * @property {Function} disconnectedCallback
 * @property {Function} adoptedCallback
 * @property {Function} attributeChangedCallback
 */

import { isConnected } from './dom-utils'

/**
 *
 * @param {Function} callbackFn
 */
const queueMicroTask = (callbackFn) => Promise.resolve().then(callbackFn)

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
     * @type {boolean}
     */
    this.polyfilled = true

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
     * @type {{}}
     * @private
     */
    this._definitions = {}

    /**
     *
     * @type {{}}
     * @private
     */
    this._whenDefined = {}

    /**
     *
     * @type {WeakMap<Element,string>}
     * @private
     */
    this._customElementState = new WeakMap()

    /**
     *
     * @type {WeakMap<Element,CustomElementDefinition>}
     * @private
     */
    this._customElementDefinition = new WeakMap()
  }

  /**
   *
   * @param {string} name
   * @returns {Function|undefined}
   * @see https://www.w3.org/TR/custom-elements/#dom-customelementsregistry-get
   */
  get (name) {
    // 1.
    if (this._definitions.hasOwnProperty(name)) {
      return this._definitions[ name ].constructor
    }
  }

  /**
   *
   * @param {string} name
   * @returns {Promise<void>}
   * @see https://www.w3.org/TR/custom-elements/#dom-customelementsregistry-whendefined
   */
  whenDefined (name) {
    // 1.
    if (!isValidCustomElementName(name)) {
      return Promise.reject(new SyntaxError(`the element name ${name} is not valid`))
    }

    // 2.
    if (this._definitions.hasOwnProperty(name)) {
      return Promise.resolve()
    }

    // 3.
    const map = this._whenDefined

    // 4.
    if (!map.hasOwnProperty(name)) {
      let resolver
      const promise = new Promise((resolve) => resolver = resolve)

      map[ name ] = { promise, resolve: resolver }
    }

    // 5.
    const promise = map[ name ]

    // 6.
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
      lifecycleCallbacks,
      constructionStack: []
    }

    // 15.
    this._definitions[ name ] = definition

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
    if (this._whenDefined.hasOwnProperty(name)) {
      // 19.1.
      const promise = this._whenDefined[ name ]

      // 19.2.
      promise.resolve()

      // 19.3.
      delete this._whenDefined[ name ]
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
    const state = this._getState(element)

    // 1.
    if (state === 'custom') {
      return
    }

    // 2.
    if (state === 'failed') {
      return
    }

    for (let i = 0; i < element.attributes.length; i++) {
      const attribute = element.attributes[ i ]

      this._callbackReaction(element, 'attributeChangedCallback', [
        attribute.localName,
        null,
        attribute.value,
        attribute.namespaceURI
      ])
    }

    // 4.
    if (isConnected(element)) {
      this._callbackReaction(element, 'connectedCallback', [])
    }

    // 5.
    definition.constructionStack.push(element)

    // 6.
    const C = definition.constructor
    let constructResult

    try {
      // 7.
      constructResult = Reflect.construct(C, [])
      // 8.
      definition.constructionStack.pop()
    } catch (error) {
      // 9.1.
      this._customElementState.set(element, 'failed')
      // 9.2.
      throw error
    }

    // 10.
    if (constructResult != element) {
      throw new Error('invalid state error')
    }

    // 11.
    this._customElementState.set(element, 'custom')

    // 12.
    this._customElementDefinition.set(element, definition)

    // todo: upgrade reaction
  }

  /**
   *
   * @param {Element} element
   * @returns {CustomElementDefinition}
   * @private
   */
  _getElementDefinition (element) {
    let name = element.localName.toLowerCase()
    const is = element.getAttribute('is')

    if (is != null) {
      name = is
    }

    return this._definitions[ name ]
  }

  /**
   *
   * @param {Function} constructor
   * @returns {CustomElementDefinition}
   * @private
   */
  _lookupByConstructor (constructor) {
    let result = null

    Object.keys(this._definitions).forEach((key) => {
      const definition = this._definitions[ key ]

      if (definition.constructor === constructor) {
        result = definition
      }
    })

    return result
  }

  /**
   *
   * @param {Element} element
   * @private
   * @see https://www.w3.org/TR/custom-elements/#concept-try-upgrade
   */
  _tryUpgradeElement (element) {
    // 1.
    const definition = this._getElementDefinition(element)

    // 2.
    if (definition != null) {
      queueMicroTask(() => {
        this._upgradeElement(element, definition)
      })
    }
  }

  /**
   *
   * @param {Element} element
   * @param {string} callbackName
   * @param {Array} args
   * @private
   * @see https://www.w3.org/TR/custom-elements/#enqueue-a-custom-element-callback-reaction
   */
  _callbackReaction (element, callbackName, args) {
    // 1.
    const definition = this._getElementDefinition(element)
    // 2.
    const callback = definition.lifecycleCallbacks[ callbackName ]

    // 3.
    if (callback === null) {
      return
    }

    // 4.2.
    if (callbackName === 'attributeChangedCallback' && definition.observedAttributes.indexOf(args[ 0 ]) === -1) {
      return
    }

    queueMicroTask(() => {
      callback.apply(element, args)
    })
  }

  /**
   *
   * @param {Element} element
   * @returns {string}
   * @private
   */
  _getState (element) {
    return this._customElementState.get(element)
  }
}
