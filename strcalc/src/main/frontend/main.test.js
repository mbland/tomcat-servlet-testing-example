/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { describe, afterEach, expect, test } from 'vitest'
import { PageLoader } from './test-helpers.js'

describe('String Calculator UI', () => {
  const loader = new PageLoader('/strcalc')

  afterEach(() => loader.closeAll())

  describe('initial state', () => {
    test('contains the "Hello, World!" placeholder', async () => {
      const { document } = await loader.load('index.html')

      const e = document.querySelector('#app .placeholder a')

      expect(e.textContent).toContain('Hello, World!')
      expect(e.href).toContain('%22Hello,_World!%22')
    })
  })
})
