/*
 * Copyright (c) 2016 Ruben Schmidmeister <ruby@fog.im>
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details.
 */

import { ElementConstructor } from '../element-constructor'

/**
 *
 * @type {Array}
 * @see https://html.spec.whatwg.org/multipage/indices.html#element-interfaces
 */
const elementInterfaces = [
  'Anchor',
  'Area',
  'Audio',
  'Base',
  'Quote',
  'Body',
  'BR',
  'Button',
  'Canvas',
  'TableCaption',
  'TableCol',
  'MenuItem',
  'Data',
  'DataList',
  'Mod',
  'Details',
  'Dialog',
  'Div',
  'DList',
  'Embed',
  'FieldSet',
  'Form',
  'Heading',
  'Head',
  'HR',
  'Html',
  'IFrame',
  'Image',
  'Input',
  'Keygen',
  'Label',
  'Legend',
  'LI',
  'Link',
  'Map',
  'Menu',
  'Meta',
  'Meter',
  'Object',
  'OList',
  'OptGroup',
  'Option',
  'Output',
  'Paragraph',
  'Param',
  'Picture',
  'Pre',
  'Progress',
  'Script',
  'Select',
  'Slot',
  'Source',
  'Span',
  'Style',
  'Table',
  'TableSection',
  'TableCell',
  'Template',
  'TextArea',
  'Time',
  'Title',
  'TableRow',
  'Track',
  'UList',
  'Video',
  'Unknown'
]

/**
 *
 * @param {Function} Original
 * @param {CustomElementsRegistry} registry
 * @returns {Function}
 */
const wrapElementConstructor = (Original, registry) => {
  const proto = Original.prototype
  const Constructor = ElementConstructor(registry, tagName)

  Constructor.prototype = Object.create(proto)

  return Constructor
}

/**
 *
 * @param {CustomElementsRegistry} registry
 */
export function patchConstructors (registry) {
  const _HTMLElement = window.HTMLElement

  const HTMLElement = ElementConstructor(registry)
  HTMLElement.prototype = Object.create(_HTMLElement.prototype)

  window.HTMLElement = HTMLElement

  elementInterfaces.forEach((name) => {
    const fullName = `HTML${name}Element`
    const _C = window[ fullName ]

    if (!_C) {
      return
    }

    const proto = _C.prototype

    Object.setPrototypeOf(proto, window.HTMLElement.prototype)

    const C = function () {
      return window.HTMLElement.apply(this, arguments)
    }

    C.prototype = proto

    window[fullName] = C
  })
}
