/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import initApp from './init'
import { afterAll, afterEach, describe, expect, test } from 'vitest'
import StringCalculatorPage from '../test/page'

// @vitest-environment jsdom
describe('initial state after calling initApp', () => {
  const page = StringCalculatorPage.new()

  afterEach(() => page.clear())
  afterAll(() => page.remove())

  test('contains the "Hello, World!" placeholder', async () => {
    initApp({ appElem: page.appElem })

    const e = page.placeholder()
    expect(e.textContent).toContain('Hello, World!')
    expect(e.href).toContain('%22Hello,_World!%22')
  })
})

