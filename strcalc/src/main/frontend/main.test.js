/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import StringCalculatorPage from './test/page.js'
import TestPageOpener from 'test-page-opener'

describe('String Calculator UI on initial page load', () => {
  /** @type {TestPageOpener} */
  let opener

  beforeAll(async () => {opener = await TestPageOpener.create('/strcalc/')})
  afterEach(() => opener.closeAll())

  test('contains the "Hello, World!" placeholder', async () => {
    const { document } = await opener.open('index.html')
    /** @type {(HTMLDivElement | null)} */
    const appElem = document.querySelector('#app')

    if (appElem === null) return expect(appElem).not.toBeNull()
    const e = new StringCalculatorPage(appElem, document).title()
    expect(e.textContent).toContain('Hello, World!')
    expect(e.href).toContain('%22Hello,_World!%22')
  })
})
