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
 * @returns {boolean}
 */
export function checkSupport () {
  const name = `dummy-button-${Date.now()}`

  try {
    class Dummy extends window.HTMLButtonElement {
    }

    window.customElements.define(name, Dummy, { extends: 'button' })

    const element = document.createElement('button', { is: name })

    if (!(element instanceof Dummy)) {
      return false
    }

    if (element.getAttribute('is') !== name) {
      return false
    }
  } catch (_) {
    return false
  }

  return true
}
