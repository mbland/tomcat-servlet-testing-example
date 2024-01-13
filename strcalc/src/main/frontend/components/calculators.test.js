/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { default as calculators, DEFAULT_ENDPOINT } from './calculators.js'
import { afterEach, describe, expect, test, vi } from 'vitest'
import setupFetchStub from '../test/fetch-stub.js'
import { postOptions } from './request.js'

describe('calculators', () => {
  /**
   * @param {string} numbersStr - input to the String Calculator
   * @returns {FormData} - form data to submit to the String Calculator
   */
  const setupData = (numbersStr) => {
    const data = new FormData()
    data.append('numbers', numbersStr)
    return data
  }

  afterEach(() => { vi.unstubAllGlobals() })

  describe('defaultPost', () => {
    test('posts same server by default', async () => {
      const data = setupData('2,2')
      const fetchStub = setupFetchStub({ result: 5 })

      await expect(calculators.api.impl(data)).resolves.toEqual({ result: 5 })
      expect(fetchStub).toHaveBeenCalledWith(
        DEFAULT_ENDPOINT, postOptions({ numbers: '2,2' }))
    })

    test('posts to globalThis.STRCALC_BACKEND', async () => {
      const data = setupData('2,2')
      const fetchStub = setupFetchStub({ result: 5 })
      vi.stubGlobal('STRCALC_BACKEND', 'http://localhost:8080/strcalc/')

      await expect(calculators.api.impl(data)).resolves.toEqual({ result: 5 })
      expect(fetchStub).toHaveBeenCalledWith(
        new URL(DEFAULT_ENDPOINT, 'http://localhost:8080/strcalc/').toString(),
        postOptions({ numbers: '2,2' })
      )
    })
  })

  test('tempCalculator rejects with Error', async () => {
    const data = setupData('2,2')

    await expect(calculators.browser.impl(data)).rejects.toThrow(
      new Error('Temporary in-browser calculator received: "2,2"')
    )
  })
})
