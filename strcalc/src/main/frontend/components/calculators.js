/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { postFormData } from './request'

export const DEFAULT_ENDPOINT = './add'

const defaultPost = async (data)=> postFormData(DEFAULT_ENDPOINT, data)

const tempCalculator = async (data) => Promise.reject(new Error(
  `Temporary in-browser calculator received: "${data.get('numbers')}"`
))

/**
 * Collection of production String Calculator implementations
 */
export default {
  'api': { label: 'Tomcat backend API (Java)', impl: defaultPost },
  'browser': { label: 'In-browser (JavaScript)', impl: tempCalculator }
}
