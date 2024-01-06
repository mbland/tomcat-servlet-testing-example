/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { postFormData } from './request.js'

export const DEFAULT_ENDPOINT = './add'

const backendUrl = () => globalThis.STRCALC_BACKEND ?
  new URL(DEFAULT_ENDPOINT, globalThis.STRCALC_BACKEND).toString() :
  DEFAULT_ENDPOINT

const backendCalculator = async (data)=> postFormData(backendUrl(), data)

const tempCalculator = async (data) => Promise.reject(new Error(
  `Temporary in-browser calculator received: "${data.get('numbers')}"`
))

/**
 * Collection of production String Calculator implementations
 *
 * Each implementation takes a FormData instance containing only a
 * 'numbers' field as its single argument.
 */
export default {
  'api': { label: 'Tomcat backend API (Java)', impl: backendCalculator },
  'browser': { label: 'In-browser (JavaScript)', impl: tempCalculator }
}
