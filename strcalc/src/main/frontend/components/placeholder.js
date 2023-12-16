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

import Template from './placeholder.hbs'

export default class Placeholder {

  /**
   * Initializes the Placeholder within the document.
   * @param {Window} window - the browser window object
   * @param {Document} document - a Document or DocumentFragment
   */
  static init(window, document) {
    document.querySelector('#app').appendChild(Template({
      message: 'Hello, World!',
      url: 'https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'
    }))
  }
}
