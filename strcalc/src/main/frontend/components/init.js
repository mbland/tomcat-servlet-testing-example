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
 * @param {Window} window - the browser window object
 * @param {Document} document - a Document or DocumentFragment
 */
export default function initApp(window, document) {
  Placeholder.init(window, document)
}
