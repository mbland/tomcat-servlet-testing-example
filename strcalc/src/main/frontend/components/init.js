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

/**
 * Instantiates the top level objects and calls the `init()` method on each.
 *
 * This is a teaching example that contains minimal business logic in order to
 * demonstrate how to design much larger applications for testability.
 * @param {object} params - parameters made available to all initializers
 * @param {Element} params.appElem - parent Element containing all components
 */
export default function initApp(params) {
  [Placeholder].forEach(c => c.init(params))
}
