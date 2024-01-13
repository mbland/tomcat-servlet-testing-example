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

  /**
   * @param {Element} appElem - root element of the StringCalculator application
   * @param {Document} doc - Document object containing the application
   */
  constructor(appElem, doc = document) {
    this.appElem = appElem

    /**
     * @param {string} sel - argument for Document.querySelector()
     * @returns {(Element | {})} - the selected element from the doc, or an
     *   empty object if not found
     */
    this.#select = sel => (doc.querySelector(`#${appElem.id} ${sel}`) || {})
  }

  static new() {
    const appElem = document.createElement('div')
    appElem.id = `test-app-${this.#nextId++}`
    document.body.appendChild(appElem)
    return new StringCalculatorPage(appElem)
  }

  clear() { this.appElem.replaceChildren() }
  remove() { this.appElem.remove() }

  title() {
    return /** @type {HTMLAnchorElement} */ (this.#select('.title a'))
  }

  form() {
    return /** @type {HTMLFormElement} */ (this.#select('form'))
  }

  input() {
    return /** @type {HTMLInputElement} */ (
      this.#select('form input[name="numbers"]')
    )
  }

  impl() {
    return /** @type {HTMLInputElement} */ (
      this.#select('form input[name="impl"]:checked')
    )
  }

  submitButton() {
    return /** @type {HTMLInputElement} */ (
      this.#select('form input[type="submit"]')
    )
  }

  result() {
    return /** @type {HTMLParagraphElement} */ (this.#select('.result p'))
  }

  /**
   * @callback SubmitCallback
   * @returns {Promise<string>} the StringCalculator result
   * @throws {Error} if the .result element is missing
   * @throws {string} if the result field hasn't changed
   */

  /**
   * @param {string} value - input value for the StringCalculator UI
   * @returns {SubmitCallback} - the StringCalculator result
   */
  enterValueAndSubmit(value) {
    const orig = this.result().textContent

    this.input().value = value
    this.doSubmit()

    return async () => {
      const result = this.result().textContent
      if (result === null) throw new Error('missing .result element')
      if (result === orig) {
        return Promise.reject(`Result field hasn't changed: ${orig}`)
      }
      return Promise.resolve(result)
    }
  }

  /**
   * Submits the form via HTMLFormElement.requestSubmit()
   * You would _think_ that this.submit().click() would submit the form... Nope.
   * @see https://developer.mozilla.org/docs/Web/API/HTMLFormElement/requestSubmit
   */
  doSubmit() {
    this.form().requestSubmit(this.submitButton())
  }
}
