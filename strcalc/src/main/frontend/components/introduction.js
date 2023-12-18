/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * The placeholder component for the String Calculator application
 *
 * This is an example of a JavaScript class representing a web page component,
 * implemented using a precompiled Handlebars template.
 *
 * Implemented using Handlebars template compiled via
 * rollup-plugin-handlebars-precompiler.
 * @module placeholder
 */

import Template from './introduction.hbs'

export default class Introduction {
  /**
   * Initializes the Introduction within the document.
   * @param {object} params - parameters made available to all initializers
   * @param {Element} params.appElem - parent Element containing all components
   */
  init({ appElem }) {
    appElem.appendChild(Template({
      message: 'Hello, World!',
      url: 'https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'
    }))
  }
}
