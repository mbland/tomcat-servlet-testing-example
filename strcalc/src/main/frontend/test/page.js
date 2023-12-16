/* eslint-env browser */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Represents the StringCalculator web page.
 *
 * Follows the Page Object pattern from the Selenium WebDriver documentation,
 * though we're using the DOM directly rather than Selenium.
 * @see https://www.selenium.dev/documentation/test_practices/design_strategies/
 */
export default class StringCalculatorPage {
  static #pages = []

  appElem
  #select

  constructor(appElem, doc = document) {
    this.appElem = appElem
    this.#select = sel => doc.querySelector(`#${appElem.id} ${sel}`)
  }

  static new(appElemId) {
    const appElem = document.createElement('div')
    appElem.id = appElemId
    document.body.appendChild(appElem)

    const page = new StringCalculatorPage(appElem)
    this.#pages.push(page)
    return page
  }

  static cleanup() { this.#pages.forEach(p => p.appElem.remove()) }

  placeholder() { return this.#select('.placeholder a') }
}
