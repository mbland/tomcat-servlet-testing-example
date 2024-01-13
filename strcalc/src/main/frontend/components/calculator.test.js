/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Calculator from './calculator.js'
import Template from './calculator.hbs'
import { afterAll, afterEach, describe, expect, test, vi } from 'vitest'
import StringCalculatorPage from '../test/page.js'

// @vitest-environment jsdom
describe('Calculator', () => {
  const page = StringCalculatorPage.new()

  const setup = () => {
    const postFormData = vi.fn()
    /** @type {import('./calculators.js').StrCalcDescriptors} */
    const calculators = {
      'api': { label: 'API', impl: postFormData },
      'browser': { label: 'Browser', impl: vi.fn() }
    }

    new Calculator().init({ appElem: page.appElem, calculators })
    return { page, postFormData }
  }

  const setupConsoleErrorSpy = () => {
    const consoleSpy = vi.spyOn(console, 'error')
      .mockImplementationOnce(() => {})

    return {
      consoleSpy,
      loggedError: () => {
        const lastCall = consoleSpy.mock.lastCall
        if (!lastCall) throw new Error('error not logged')
        return lastCall
      }
    }
  }

  /**
   * @param {string} numbersString - input to the StringCalculator
   * @returns {FormData} - form data to submit to the implementation
   */
  const expectedFormData = (numbersString) => {
    const data = new FormData()
    data.append('numbers', numbersString)
    return data
  }

  afterEach(() => {
    vi.restoreAllMocks()
    page.clear()
  })

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

  test('logs error if missing numbers input element', async () => {
    const { loggedError } = setupConsoleErrorSpy()
    /** @type {import('./calculators.js').StrCalcDescriptors} */
    const calculators = {}
    /**
     * @param {any} context - init parameters for template
     * @returns {DocumentFragment} - template elements without #numbers element
     */
    const BadTemplate = (context) => {
      const t = Template({ context })
      const [ form ] = t.children
      const input = form.querySelector('#numbers')

      if (input !== null) input.remove()
      return t
    }

    new Calculator().init(
      { appElem: page.appElem, calculators, instantiate: BadTemplate }
    )

    expect(await vi.waitFor(loggedError))
      .toStrictEqual(['missing numbers input'])
  })

  test('logs error if missing implementation input element', async () => {
    const { page } = setup()
    const { loggedError } = setupConsoleErrorSpy()

    page.impl().remove()
    page.enterValueAndSubmit('2,2')

    expect(await vi.waitFor(loggedError))
      .toStrictEqual(['missing implementation input'])
  })

  test('logs error if missing result element', async () => {
    const { page } = setup()
    const { loggedError } = setupConsoleErrorSpy()

    page.result().remove()
    page.enterValueAndSubmit('2,2')

    expect(await vi.waitFor(loggedError))
      .toStrictEqual(['missing result element'])
  })
})
