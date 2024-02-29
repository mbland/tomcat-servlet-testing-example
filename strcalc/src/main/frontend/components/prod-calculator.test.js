/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ProdStringCalculator from './prod-calculator.js'
import { beforeEach, describe, expect, test } from 'vitest'

describe('ProdStringCalculator', () => {
  /** @type {ProdStringCalculator} */
  let calc

  beforeEach(() => {
    calc = new ProdStringCalculator()
  })

  test('empty string returns zero', () => {
    expect(calc.add('')).toEqual(0)
  })

  test('single number returns same number', () => {
    expect(calc.add('1')).toEqual(1)
  })

  test('returns sum of two numbers', () => {
    expect(calc.add('1,2')).toEqual(3)
  })
})
