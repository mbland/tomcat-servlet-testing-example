/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import App from './app.js'
import { afterAll, afterEach, describe, expect, test } from 'vitest'
import StringCalculatorPage from '../test/page'

// @vitest-environment jsdom
describe('initial state after calling App.init()', () => {
  const page = StringCalculatorPage.new()
  const calculators = {
    'first': { label: 'First calculator', impl: null },
    'second': { label: 'Second calculator', impl: null },
    'third': { label: 'Third calculator', impl: null }
  }

  afterEach(() => page.clear())
  afterAll(() => page.remove())

  test('contains the "Hello, World!" title', async () => {
    new App().init({ appElem: page.appElem, calculators })

    const e = page.title()
    expect(e.textContent).toContain('Hello, World!')
    expect(e.href).toContain('%22Hello,_World!%22')
  })
})

