/* eslint-env browser */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Initializer for the String Calculator web application.
 * @module init
 */

import Placeholder from './placeholder'
import Calculator from './calculator'

export default class App {
  /**
   * Instantiates the top level objects and calls the `init()` method on each.
   *
   * This is a teaching example that contains minimal business logic in order to
   * demonstrate how to design much larger applications for testability.
   * @param {object} params - parameters made available to all initializers
   * @param {Element} params.appElem - parent Element containing all components
   * @param {string} params.apiUrl - API backend server URL
   * @param {Function} params.postForm - posts form data to API
   */
  init(params) {
    // In this example application, none of the components depend on one
    // another, so we can create and initialize them uniformly. If the
    // application required building a more complex object graph, this is where
    // we could do it.
    //
    // The basic process would be:
    //
    // - Instantiate each object in the required order, making sure all
    //   references to other objects are initialized. Each constructor should do
    //   the minimum work needed to validate and/or initialize its own
    //   references.
    // - Call init() on each object to do the actual work of setting up its
    //   initial application state within the document.
    const components = [
      new Placeholder(),
      new Calculator()
    ]
    components.forEach(c => c.init(params))
  }
}
