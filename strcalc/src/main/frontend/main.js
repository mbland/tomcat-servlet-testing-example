/* eslint-env browser */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Entrypoint of the String Calculator web application.
 *
 * Delegates to the 'init' module to initialize the application on
 * DOMContentLoaded.
 *
 * This is a teaching example that contains minimal business logic in order to
 * demonstrate how to design much larger applications for testability.
 * @module main
 */
import initApp from './init'

/**
 * Calls the application initializer with the global window and document.
 *
 * In addition to demonstrating how ECMAScript modules are linked together,
 * this shows how to introduce a shim between globalThis and the initApp()
 * function. Most tests can then call initApp() directly, and only two tests are
 * needed to validate that start() is or isn't called.
 * @param {Window} window - the browser window object
 * @param {Document} document - a Document or DocumentFragment
 */
document.addEventListener('DOMContentLoaded', () => initApp(window, document))
