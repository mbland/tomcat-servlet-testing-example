/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { postForm } from './request'

/**
 * Collection of production String Calculator implementations
 */
export default {
  'api': { label: 'Tomcat backend API (Java)', impl: postForm },
  'browser': { label: 'In-browser (JavaScript)', impl: postForm }
}
