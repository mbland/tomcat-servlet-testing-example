/* eslint-env browser, node */

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

  async load(pagePath) {
    if (pagePath.startsWith('/')) {
      const msg = 'page path should not start with \'/\', got: '
      throw new Error(`${msg}"${pagePath}"`)
    }

    let impl = await PageLoader.getImpl()
    let page = await impl.load(this.#basePath, pagePath)

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

    let {JSDOM} = await import('jsdom')
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
    let w = this.#window.open(`${basePath}/${pagePath}`)
    return new Promise(resolve => {
      w.addEventListener('load', () => {
        this.#setCoverageStore(w)
        resolve({
          window: w, document: w.document, close() { w.close() }
        })
      })
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
  // So we use importModulesDynamically() to execute module scripts, but
  // only for those loaded from external files.
  //
  // Note on timing of <script type="module"> execution
  // --------------------------------------------------
  // Technically, the imported modules should execute similarly to
  // <script defer> and execute before 'DOMContentLoaded'. However, modules
  // imported with this function will execute _on_ 'DOMContentLoaded'.
  //
  // This is because, without this function's coordination, 'DOMContentLoaded'
  // and 'load' will fire before the the dynamic import() calls registered by
  // importModulesDynamically() execute.
  //
  // More specifically, this will happen on the _first_ test execution when
  // running tests continuously in watch mode. On subsequent runs
  // 'DOMContentLoaded' and 'load' will fire after imports complete.
  // console.log() statements will show this, as described in detail in the
  // implementation comments.
  //
  // As a result, until JSDOM executes modules, we can't register handlers for
  // these events in our module code and expect JSDOM based tests to pass. We
  // can add these handlers in inline non-module <script>s, but those can't
  // reference module code and expect JSDOM tests to work at the moment.
  //
  // All that said, these should prove to be corner cases easily avoided by
  // sound, modular app architecture.
  async load(_, pagePath) {
    let dom = await this.#JSDOM.fromFile(
      pagePath, {resources: 'usable', runScripts: 'dangerously'}
    )

    // Originally this function returned the result object directly, not
    // wrapped in the `done` Promise. This was because the 'load' event fires
    // before the modules are imported (as described in the function
    // header comment above). Or so I thought...
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
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED
    //   Error: Could not load link: "file:///.../style.css"
    //   [...snip...]
    //     isAbortError: true
    //
    // What's interesting is that by making the close() function in the
    // returned object a noop, avoiding the error, the pattern looked like:
    //
    // First run:
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   DOMContentLoaded
    //   LOADED
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED
    //
    // Most subsequent runs:
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED
    //
    // Some subsequent runs:
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED
    //   stdout | unknown test
    //   DOMContentLoaded
    //   LOADED
    //
    // Failing to close the window objects is sloppy, but not waiting for 'load'
    // to fire is particularly sloppy.
    //
    // After updating the implementation to wait for 'load', but not
    // 'DOMContentLoaded', the output looked like the following (though, as
    // mentioned previously, the second 'stdout' doesn't always appear):
    //
    // First run:
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   DOMContentLoaded
    //   LOADED
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED
    //
    // Subsequent runs:
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   INITIALIZED
    //   IMPORTED
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   DOMContentLoaded
    //   LOADED
    //   CLOSED
    //
    // Finally, for consistency's sake, it seemed prudent to wait for
    // DOMContentLoaded to fire before calling importModules(). This breaks
    // from the <script defer>-like behavior a bit, but makes each run more
    // consistent. The output from the current implementation looks like this on
    // every run:
    //
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   DOMContentLoaded
    //   LOADED
    //   stdout | main.test.js > String Calculator UI > initial state > ...
    //   INITIALIZED
    //   IMPORTED
    //   CLOSED

    // Once importModules() goes away, delete this event listener and
    // 'domLoaded' Promise, and return the 'done' Promise directly. (And delete
    // this comment, and maybe the entire comment above.)
    //
    // We have to register the Promises right away, during the current event
    // loop tick, then await them.
    let domLoaded = new Promise(resolve => {
      dom.window.addEventListener('DOMContentLoaded', async () => {
        await this.#importModules(dom)
        resolve()
      })
    })
    let done = new Promise(resolve => {
      dom.window.addEventListener('load', () => {
        resolve({
          window: dom.window,
          document: dom.window.document,
          close() { dom.window.close() }
        })
      })
    })
    await domLoaded
    return done
  }
}

// Imports <script type="module"> elements parsed, but not executed, by JSDOM.
//
// Only works with scripts with a `src` attribute; it will not execute inline
// code.
//
// Remove this function once "jsdom/jsdom: <script type=module> support #2475"
// has been resolved:
// - https://github.com/jsdom/jsdom/issues/2475
async function importModulesDynamically(dom) {
  let modules = Array.from(
    dom.window.document.querySelectorAll('script[type="module"]')
  )

  // The JSDOM docs advise against setting global properties, but we don't
  // have another option given the module may access window and/or document.
  global.window = dom.window
  global.document = dom.window.document
  await Promise.all(modules.map(s => import(s.src)))
  global.window = global.document = undefined
}
