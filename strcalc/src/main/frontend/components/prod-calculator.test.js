/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ProdStringCalculator from './prod-calculator.js'
import { describe, expect, test } from 'vitest'

describe('ProdStringCalculator', () => {
  test('empty string returns zero', () => {
    let calc = new ProdStringCalculator()

    let result = calc.add('')

    expect(result).toEqual(0)
  })
})
