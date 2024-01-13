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
   * @param {import('./calculators.js').StrCalcDescriptors} params.calculators -
   *   calculator implementations
   * @param {Function} [params.instantiate] - alternative template instantiation
   *   function for testing
   * @returns {void}
   */
  init({ appElem, calculators, instantiate = Template }) {
    const calcOptions = Object.entries(calculators)
      .map(([k, v]) => ({ value: k, label: v.label }))
    const t = instantiate({ calcOptions })
    const [ form, resultElem ] = t.children

    appElem.appendChild(t)

    /** @type {(HTMLInputElement | null)} */
    const numbers = document.querySelector('#numbers')
    if (numbers === null) return console.error('missing numbers input')
    numbers.focus()

    form.addEventListener(
      'submit',
      /** @param {Event} e - form submit event */
      e => {Calculator.#submitRequest(e, resultElem, calculators)}
    )
  }

  /**
   * @param {Event} event - form submit event
   * @param {Element} resultElem - element into which to write the result
   * @param {import('./calculators.js').StrCalcDescriptors} calculators -
   *   calculator implementations
   * @returns {Promise<void>}
   * @see https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/
   */
  static async #submitRequest(event, resultElem, calculators) {
    event.preventDefault()

    const form = /** @type {HTMLFormElement} */ (event.currentTarget)
    const data = new FormData(form)

    /** @type {(HTMLInputElement | null)} */
    const implInput = form.querySelector('input[name="impl"]:checked')
    if (implInput === null) return console.error('missing implementation input')
    const selected = implInput.value

    /** @type {(HTMLParagraphElement | null)} */
    const result = resultElem.querySelector('p')
    if (result === null) return console.error('missing result element')

    // None of the backends need the 'impl' parameter, and the Java backend
    // will return a 500 if we send it.
    data.delete('impl')

    try {
      const response = await calculators[selected].impl(data)
      result.textContent = `Result: ${response.result}`
    } catch (err) {
      result.textContent = /** @type {any} */ (err)
    }
  }
}
