/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { describe, afterEach, expect, test } from 'vitest'
import { PageLoader } from './test/helpers'
import StringCalculatorPage from './test/page'

describe('String Calculator UI on initial page load', () => {
  const loader = new PageLoader('/strcalc')
  afterEach(() => loader.closeAll())

  test('contains the "Hello, World!" placeholder', async () => {
    const { document } = await loader.load('index.html')

    const e = new StringCalculatorPage(document).placeholder()
    expect(e.textContent).toContain('Hello, World!')
    expect(e.href).toContain('%22Hello,_World!%22')
  })
})
