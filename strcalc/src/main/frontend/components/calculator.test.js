/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Calculator from './calculator'
import { afterAll, afterEach, describe, expect, test, vi } from 'vitest'
import StringCalculatorPage from '../test/page'

// @vitest-environment jsdom
describe('Calculator', () => {
  const page = StringCalculatorPage.new()

  const setup = () => {
    const postFormData = vi.fn()
    const calculators = {
      'api': { label: 'API', impl: postFormData },
      'browser': { label: 'Browser', impl: () => {} }
    }

    new Calculator().init({ appElem: page.appElem, calculators })
    return { page, postFormData }
  }

  const expectedFormData = (numbersString) => {
    const data = new FormData()
    data.append('numbers', numbersString)
    return data
  }

  afterEach(() => page.clear())
  afterAll(() => page.remove())

  test('renders form and result placeholder', async () => {
    const { page } = setup()

    expect(page.form()).not.toBeNull()
    expect(page.result()).not.toBeNull()
  })

  test('updates result placeholder with successful result', async () => {
    const { page, postFormData } = setup()
    postFormData.mockResolvedValueOnce({ result: 5 })

    const result = vi.waitFor(page.enterValueAndSubmit('2,2'))

    await expect(result).resolves.toBe('Result: 5')
    expect(postFormData).toHaveBeenCalledWith(expectedFormData('2,2'))
  })

  test('updates result placeholder with error message', async () => {
    const { page, postFormData } = setup()
    postFormData.mockRejectedValueOnce(new Error('D\'oh!'))

    const result = vi.waitFor(page.enterValueAndSubmit('2,2'))

    await expect(result).resolves.toBe('Error: D\'oh!')
    expect(postFormData).toHaveBeenCalledWith(expectedFormData('2,2'))
  })
})
