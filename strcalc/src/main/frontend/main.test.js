/* eslint-env browser, node, jest, vitest */

import { describe, afterEach, expect, test } from 'vitest'
import { PageLoader } from './test-helpers.js'

describe('String Calculator UI', () => {
  let loader = new PageLoader('/strcalc')

  afterEach(() => loader.closeAll())

  describe('initial state', () => {
    test('contains the "Hello, World!" placeholder', async () => {
      let { document } = await loader.load('index.html')

      let e = document.querySelector('#app .placeholder')

      expect(e.textContent).toContain('Hello, World!')
    })
  })
})
