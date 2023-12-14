/* eslint-env browser, node */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import vm from 'node:vm'

/**
 * Exports test helper utilities for this project.
 * @module test-helpers
 */

/**
 * Enables tests to load page URLs both in the browser and in Node using JSDom.
 */
export class PageLoader {
  static #impl

  #basePath
  #loaded

  constructor(basePath) {
    if (!basePath.startsWith('/') || basePath.endsWith('/')) {
      const msg = 'basePath should start with \'/\' and ' +
        'not end with \'/\', got: '
      throw new Error(`${msg}"${basePath}"`)
    }
    this.#basePath = basePath
    this.#loaded = []
  }

  async load(pagePath, ctx) {
    if (pagePath.startsWith('/')) {
      const msg = 'page path should not start with \'/\', got: '
      throw new Error(`${msg}"${pagePath}"`)
    }

    const impl = await PageLoader.getImpl()
    const page = await impl.load(this.#basePath, pagePath, ctx)

    this.#loaded.push(page)
    return page
  }

  closeAll() {
    this.#loaded.forEach(p => p.close())
    this.#loaded = []
  }

  static async getImpl() {
    if (this.#impl) {
      return this.#impl
    }

    if (globalThis.window) {
      return this.#impl = new BrowserPageLoader(globalThis.window)
    }

    const {JSDOM} = await import('jsdom')
    return this.#impl = new JsdomPageLoader(JSDOM, importModulesDynamically)
  }
}

class BrowserPageLoader {
  #window

  constructor(window) {
    this.#window = window
  }

  // Loads a page and returns {window, document, close() } using the browser.
  async load(basePath, pagePath) {
    const w = this.#window.open(`${basePath}/${pagePath}`)
    return new Promise(resolve => {
      const listener = () => {
        this.#setCoverageStore(w)
        resolve({window: w, document: w.document, close() {w.close()}})
      }
      w.addEventListener('load', listener, {once: true})
    })
  }

  // This is an egregious, brittle hack that's very specific to Vitest's
  // Istanbul coverage provider. It also only collects coverage from the last
  // page loaded; it loses coverage information for all other pages.
  //
  // But as long as a test function calls BrowserPageLoader.load() only once, it
  // should work pretty well.
  #setCoverageStore(openedWindow) {
    const COVERAGE_STORE_KEY = '__VITEST_COVERAGE__'

    if (COVERAGE_STORE_KEY in openedWindow) {
      this.#window[COVERAGE_STORE_KEY] = openedWindow[COVERAGE_STORE_KEY]
    }
  }
}

// Returns window and document objects from a JSDOM-parsed HTML file.
//
// It will execute <script type="module"> elements with a `src` attribute,
// but not those with inline code. See the comment for
// importModulesDynamically().
//
// Based on hints from:
// - https://oliverjam.es/articles/frontend-testing-node-jsdom
class JsdomPageLoader {
  #JSDOM
  #importModules

  constructor(jsdom, importModules) {
    this.#JSDOM = jsdom
    this.#importModules = importModules
  }

  // Loads a page and returns { window, document, close() } using JSDOM.
  //
  // For now, executes <script type="module"> elements with a `src` attribute,
  // but does not execute such elements with inline code. This is because JSDOM
  // currently parses, but doesn't execute, <script type="module"> elements:
  //
  // - https://github.com/jsdom/jsdom/issues/2475
  //
  // Once that issue is resolved, the explicit module loading behavior can
  // be deleted from this implementation.
  //
  // Note on the timing of <script type="module"> execution
  // ------------------------------------------------------
  // Technically, the imported modules should execute similarly to
  // <script defer> and execute before 'DOMContentLoaded'. However, modules
  // imported with this function will execute _on_ 'DOMContentLoaded'. This is
  // because the JSDOM 'DOMContentLoaded' and 'load' events will fire before the
  // the dynamic import() calls resolve.
  //
  // This function sets a DOMContentLoaded listener that waits for the dynamic
  // import() operations, and then manually fires DOMContentLoaded and load
  // again. This enables (most) modules that register listeners for those
  // events to behave as expected in JSDOM based tests.
  async load(_, pagePath, ctx) {
    const dom = await this.#JSDOM.fromFile(
      pagePath, {resources: 'usable', runScripts: 'dangerously'}
    )
    const { window } = dom, { document } = window
    const vmCtx = dom.getInternalVMContext()

    // Originally this function returned the result object directly, not
    // wrapped in the `done` Promise. This was because, for the original
    // implementation, the 'load' event fired before the modules were imported.
    // Or so I thought...
    //
    // console.log() statements added in the appropriate places revealed
    // this pattern (the second 'stdout' doesn't always appear):
    //
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   DOMContentLoaded
    //   LOADED
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED
    //
    // However, it turned out that in watch mode, this held true only for the
    // _first_ test run. On every subsequent run, the entire test method would
    // finish before the 'load' event fired. This caused dom.window.close() to
    // throw an AbortError before the stylesheet from index.html finished
    // loading. This pattern appeared consistently on each run after the first:
    //
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED
    //   Error: Could not load link: "file:///.../style.css"
    //   [...snip...]
    //     isAbortError: true
    //
    // What's interesting is that by making the close() function in the result
    // object a noop, avoiding the error, the pattern looked like:
    //
    // First run:
    //   DOMContentLoaded
    //   LOADED
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED
    //
    // Most subsequent runs:
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED
    //
    // Some subsequent runs (note the "stdout | unknown test" output):
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED
    //   stdout | unknown test
    //   DOMContentLoaded
    //   LOADED
    //
    // After updating the implementation to wait for 'load', but not
    // 'DOMContentLoaded', the output looked like the following:
    //
    // First run:
    //   DOMContentLoaded
    //   LOADED
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED
    //
    // Subsequent runs:
    //   INITIALIZED
    //   IMPORTED
    //   DOMContentLoaded
    //   LOADED
    //   CLOSED
    //
    // For consistency's sake, it seemed prudent to wait for DOMContentLoaded to
    // fire before calling importModules(). The first attempt didn't fire
    // DOMContentLoaded again. This broke from the <script defer>-like behavior
    // a bit, but made each run more consistent. The output from that
    // implementation looked like this on every run:
    //
    //   DOMContentLoaded
    //   LOADED
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED
    //
    // I eventually decided to fire the DOMContentLoaded and load events
    // again in #importModulesPromise. This enables modules to register
    // listeners for those events, approximating the expectation that modules
    // will run before DOMContentLoaded.
    //
    // Adding some slightly more descriptive output results in:
    //
    //   AWAITING MODULE IMPORTS
    //   DOMContentLoaded
    //   IMPORT BEGIN
    //   LOADED
    //   IMPORTING main.js
    //   IMPORT END
    //   INITIALIZED on DOMContentLoaded
    //   LOADED - resetting global window and document
    //
    // Since #importModulesPromise now resolves on this final 'load' event,
    // we're back to returning the result object directly.

    // Upon resolution of jsdom/jsdom#2475, delete this #importModulesPromise
    // call. (And delete this comment, and maybe the entire comment above.)
    await this.#importModulesPromise(window, document, vmCtx, ctx)
    return { window, document, close() { window.close() } }
  }

  /**
   * Dynamically imports ECMAScript modules after the DOMContentLoaded event.
   * @param {Window} window - the JSDOM window object
   * @param {Document} document - the JSDOM window.document object
   * @param vmCtx
   * @param ctx
   * @returns {Promise} - a Promise resolved after importing all ES modules
   */
  #importModulesPromise(window, document, vmCtx, ctx) {
    return new Promise(resolve => {
      const importModules = async () => {
        // The JSDOM docs advise against setting global properties, but we don't
        // really have another option given any module may access window and/or
        // document.
        //
        // (I tried to explore invoking ES modules properly inside the JSDOM,
        // and realized that way lies madness. At least, I couldn't yet figure
        // out how to access the Vite/Vitest module path resolver or Rollup
        // plugins. Then there's the matter of importmaps. I may still pick at
        // it, but staring directly at it right now isn't productive.)
        //
        // Also, unless the module takes care to close over window or document,
        // they may still reference the global.window and global.document
        // attributes. This isn't a common cause for concern in a browser, but
        // resetting these global properties before a JSDOM listener fires can
        // cause it to error. This, in turn, can potentially cause a test to
        // hang or fail.
        //
        // This is why we keep global.window and global.document set until
        // the load event handler below fires after the manually dispatched
        // load event. This is best-effort, of course, as we can't know if any
        // async ops dispatched by those listeners will register a 'load' event
        // later. In that case, window and document may be undefined for those
        // listeners.
        //
        // The best defense against this problem would be to design the app to
        // register closures over window and document. That would ensure they
        // remain defined even after removal from globalThis.
        // globalThis.window = window
        // globalThis.document = document
        await this.#importModules(window, document, vmCtx, ctx)

        // The DOMContentLoaded and load events registered by JSDOM.fromFile()
        // will already have fired by this point.
        //
        // Manually firing DOMContentLoaded again after loading modules
        // approximates the requirement that modules execute before
        // DOMContentLoaded. This means that the modules can register
        // DOMContentLoaded event listeners and have them fire here. That
        // code shouldn't really be sensitive to the fact that
        // DOMContentLoaded fired earlier, but it's a possibility.
        //
        // For the same reason, we fire the 'load' event again as well. When
        // that listener executes, we can finally reset the global.window and
        // global.document variables.
        const resetGlobals = () => {
          // delete globalThis.document
          // delete globalThis.window
          resolve()
        }
        document.dispatchEvent(new window.Event(
          'DOMContentLoaded', {bubbles: true, cancelable: false}
        ))

        // Register our 'load' listener after any DOMContentLoaded listeners
        // have fired. This attempts to ensure (but cannot guarantee) that the
        // global window and document objects remain valid for any 'load'
        // listeners registered by the DOMContentLoaded listeners.
        window.addEventListener('load', resetGlobals, {once: true})
        window.dispatchEvent(new window.Event(
          'load', {bubbles: false, cancelable: false}
        ))
      }
      document.addEventListener('DOMContentLoaded', importModules, {once: true})
    })
  }
}

/**
 * Imports <script type="module"> elements parsed, but not executed, by JSDOM.
 *
 * Only works with scripts with a `src` attribute; it will not execute inline
 * code.
 *
 * If a module exports a default function(window, document), this will invoke
 * that function with the JSDOM window and document.
 * @private
 * @param {Window} window - the JSDOM window object
 * @param {Document} doc - the JSDOM window.document object
 * @param vmCtx
 * @param ctx
 * @returns {Promise} - a Promise resolved after importing all JS modules in doc
 */
function importModulesDynamically(window, doc, vmCtx, ctx) {
  const modules = doc.querySelectorAll('script[type="module"]')
  return Promise.all(Array.from(modules).map(async m => {
    return (m.src === undefined) ? undefined : ctx.executeId(m.src, vmCtx)
  }))
}
