/* eslint-env browser, node, jest, vitest */
'use strict'
import { describe, expect, test } from 'vitest'
import { JSDOM } from 'jsdom'

// Returns window and document objects from a JSDOM-parsed HTML file.
//
// It will execute <script type="module"> elements with a `src` attribute,
// but not those with inline code. See the comment for importModules().
//
// Based on hints from:
// - https://oliverjam.es/articles/frontend-testing-node-jsdom
let loadFromFile = async (filePath) => {
  let dom = await JSDOM.fromFile(
    filePath, { resources: 'usable', runScripts: 'dangerously' }
  )

  // Once importModules() goes away, wrap the return value in a Promise that
  // resolves via dom.window.addEventListener('load', ...).
  await importModules(dom)
  return { window: dom.window, document: dom.window.document }
}

// Imports <script type="module"> elements parsed, but not executed, by JSDOM.
//
// Only works with scripts with a `src` attribute; it will not execute inline
// code.
//
// Remove this function once "jsdom/jsdom: <script type=module> support #2475"
// has been resolved:
// - https://github.com/jsdom/jsdom/issues/2475
//
// Note on timing of script execution
// ----------------------------------
// By the time the dynamic import() calls registered by importModules() begin
// executing, the window's 'DOMContentLoaded' and 'load' events will have
// already fired. Technically, the imported modules should execute similarly
// to <script defer> and execute before 'DOMContentLoaded'. As a result, we
// can't register handlers for these events in our module code. We can add these
// handlers in inline <script>s, but those can't reference module code and
// expect JSDOM tests to work at the moment.
//
// All that said, these should prove to be corner cases easily avoided by sound,
// modular app architecture.
let importModules = async (dom) => {
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

describe('String Calculator UI', () => {
  describe('initial state', () => {
    test('contains the "Hello, World!" placeholder', async () => {
      let { document } = await loadFromFile('./index.html')

      let e = document.querySelector('#app .placeholder')

      expect(e.textContent).toContain('Hello, World!')
    })
  })
})
