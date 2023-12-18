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
   * @param {object} params.calculators - calculator implementations
   */
  init({ appElem, calculators }) {
    const calcOptions = Object.entries(calculators)
      .map(([k, v]) => ({ value: k, label: v.label }))
    const t = Template({ calcOptions })
    const [ form, resultElem ] = t.children

    appElem.appendChild(t)
    document.querySelector('#numbers').focus()
    form.addEventListener(
      'submit', e => Calculator.#submitRequest(e, resultElem, calculators)
    )
  }

  // https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/
  static async #submitRequest(event, resultElem, calculators) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)
    const selected = form.querySelector('input[name="impl"]:checked').value
    const result = resultElem.querySelector('p')

    // None of the backends need the 'impl' parameter, and the Java backend
    // will return a 500 if we send it.
    data.delete('impl')

    try {
      const response = await calculators[selected].impl(data)
      result.textContent = `Result: ${response.result}`
    } catch (err) {
      result.textContent = err
    }
  }
}
