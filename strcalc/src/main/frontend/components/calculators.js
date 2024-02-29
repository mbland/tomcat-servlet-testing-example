/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
/* global STRCALC_BACKEND */

import ProdStringCalculator from './prod-calculator.js'
import { postFormData } from './request.js'

export const DEFAULT_ENDPOINT = './add'

const backendUrl = () => STRCALC_BACKEND ?
  new URL(DEFAULT_ENDPOINT, STRCALC_BACKEND).toString() :
  DEFAULT_ENDPOINT

/**
 * @typedef {object} StrCalcPayload
 * @property {number} [result] - the result of the calculation
 * @property {string} [error] - error message if the request failed
 */

/**
 * Function that invokes a specific String Calculator implementation
 * @callback StrCalcCallback
 * @param {FormData} data - form data providing String Calculator input
 * @returns {Promise<StrCalcPayload>} - the String Calculator result
 */

/**
 * Posts the String Calculator input to the backend implementation
 * @type {StrCalcCallback}
 */
const backendCalculator = async (data) => postFormData(backendUrl(), data)

/**
 * Returns the result from the in-browser ProdStringCalculator
 * @type {StrCalcCallback}
 */
const browserCalculator = async (data) => ({
  result: new ProdStringCalculator().add(`${data.get('numbers')}`)
})

/**
 * Describes a specific StringCalculator implementation
 * @typedef {object} StrCalcDescriptor
 * @property {string} label - descriptive name describing the implementation
 * @property {StrCalcCallback} impl - callback invoking StringCalculator impl
 */

/**
 * Collection of production String Calculator implementations
 *
 * Each implementation takes a FormData instance containing only a
 * 'numbers' field as its single argument.
 * @typedef {Object.<string, StrCalcDescriptor>} StrCalcDescriptors
 */
/** @type {StrCalcDescriptors} */
export default {
  'api': { label: 'Tomcat backend API (Java)', impl: backendCalculator },
  'browser': { label: 'In-browser (JavaScript)', impl: browserCalculator }
}
