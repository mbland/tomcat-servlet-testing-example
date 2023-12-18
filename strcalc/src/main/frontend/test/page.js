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
  static #nextId = 0

  appElem
  #select

  constructor(appElem, doc = document) {
    this.appElem = appElem
    this.#select = sel => doc.querySelector(`#${appElem.id} ${sel}`)
  }

  static new() {
    const appElem = document.createElement('div')
    appElem.id = `test-app-${this.#nextId++}`
    document.body.appendChild(appElem)
    return new StringCalculatorPage(appElem)
  }

  clear() { this.appElem.replaceChildren() }
  remove() { this.appElem.remove() }

  title() { return this.#select('.title a') }
  form() { return this.#select('form') }
  input() { return this.#select('form input[name="numbers"]') }
  submit() { return this.#select('form input[type="submit"]') }
  result() { return this.#select('.result p') }

  enterValueAndSubmit(value) {
    const orig = this.result().textContent

    this.input().value = value

    // You would _think_ that this.submit().click() would submit the form...
    // Nope:
    // - https://developer.mozilla.org/docs/Web/API/HTMLFormElement/requestSubmit
    this.form().requestSubmit(this.submit())

    return async () => {
      const result = this.result().textContent
      if (result === orig) {
        return Promise.reject(`Result field hasn't changed: ${orig}`)
      }
      return Promise.resolve(result)
    }
  }
}
