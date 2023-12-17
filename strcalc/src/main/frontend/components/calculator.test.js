/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Calculator from './calculator'
import { afterAll, afterEach, describe, expect, test, vi } from 'vitest'
import { resolvedUrl } from '../test/helpers.js'
import StringCalculatorPage from '../test/page'

// @vitest-environment jsdom
describe('Calculator', () => {
  const page = StringCalculatorPage.new()

  const setup = () => {
    const postForm = vi.fn()
    new Calculator().init({ appElem: page.appElem, apiUrl: './add', postForm })
    return { page, postForm }
  }

  afterEach(() => page.clear())
  afterAll(() => page.remove())

  test('renders form and result placeholder', async () => {
    const { page } = setup()

    expect(page.form()).not.toBeNull()
    expect(page.form().action).toBe(resolvedUrl('./add'))
  })

  test('updates result placeholder with successful result', async () => {
    const { page, postForm } = setup()
    postForm.mockResolvedValueOnce({ result: 5 })

    const result = vi.waitFor(page.enterValueAndSubmit('2,2'))

    await expect(result).resolves.toBe('Result: 5')
    expect(postForm).toHaveBeenCalledWith(page.form())
  })

  test('updates result placeholder with error message', async () => {
    const { page, postForm } = setup()
    postForm.mockRejectedValueOnce(new Error('D\'oh!'))

    const result = vi.waitFor(page.enterValueAndSubmit('2,2'))

    await expect(result).resolves.toBe('Error: D\'oh!')
  })
})
