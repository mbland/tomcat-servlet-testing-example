/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Template from './calculator.hbs'

export default class Calculator {
  /**
   * Initializes the Calculator within the document.
   * @param {object} params - parameters made available to all initializers
   * @param {Element} params.appElem - parent Element containing all components
   * @param {string} params.apiUrl - API backend server URL
   * @param {Function} params.postForm - posts form data to API
   */
  static init({ appElem, apiUrl, postForm }) {
    const t = Template({ apiUrl })
    const [ form, resultElem ] = t.children

    appElem.appendChild(t)
    form.addEventListener(
      'submit', e => this.#submitRequest(e, resultElem, postForm)
    )
  }

  // https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/
  static async #submitRequest(event, resultElem, postForm) {
    event.preventDefault()

    const result = resultElem.querySelector('p')

    try {
      const response = await postForm(event.currentTarget)
      result.textContent = `Result: ${response.result}`
    } catch (err) {
      result.textContent = err
    }
  }
}
