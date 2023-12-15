/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import initApp from './init'
import { describe, expect, test } from 'vitest'
import { fragment } from './test-helpers.js'
import StringCalculatorPage from './test-page.js'

// @vitest-environment jsdom
describe('initial state after calling initApp', () => {
  test('contains the "Hello, World!" placeholder', async () => {
    const document = fragment('<div id="app"></div>')

    initApp(window, document)

    const e = new StringCalculatorPage(document).getPlaceholder()
    expect(e.textContent).toContain('Hello, World!')
    expect(e.href).toContain('%22Hello,_World!%22')
  })
})

