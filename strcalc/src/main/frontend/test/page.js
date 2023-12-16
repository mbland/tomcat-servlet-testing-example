/* eslint-env browser */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { fragment } from './helpers'

/**
 * Represents the StringCalculator web page.
 *
 * Follows the Page Object pattern from the Selenium WebDriver documentation,
 * though we're using the DOM directly rather than Selenium.
 * @see https://www.selenium.dev/documentation/test_practices/design_strategies/
 */
export default class StringCalculatorPage {
  document
  appElem
  #select

  constructor(doc) {
    this.document = doc !== undefined ? doc : fragment('<div id="app"></div>')
    this.appElem = this.document.querySelector('#app')
    this.#select = s => this.document.querySelector(`#${this.appElem.id} ${s}`)
  }

  placeholder() { return this.#select('.placeholder a') }
}
