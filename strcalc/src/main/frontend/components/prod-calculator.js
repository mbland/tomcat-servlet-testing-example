/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export default class ProdStringCalculator {
  /**
   * Returns the sum of the numbers in the input string.
   * @see https://osherove.com/tdd-kata-1
   * @param {string} s - delimited string of numbers to add
   * @returns {number} - the sum of the numbers in s
   */
  add(s) {
    if (s === '') {
      return 0
    }
    return parseInt(s)
  }
}
