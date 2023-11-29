/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Template from './placeholder.hbs'

export default class Placeholder {
  #document

  constructor(document) {
    this.#document = document
  }

  init() {
    this.#document.querySelector('#app').innerHTML = Template({
      message: 'Hello, World!',
      url: 'https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'
    })
  }
}
