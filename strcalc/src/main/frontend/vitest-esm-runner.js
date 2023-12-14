/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { VitestTestRunner } from 'vitest/runners'

export default class VitestEsmRunner extends VitestTestRunner {
  constructor(...args) {
    super(...args)
  }

  extendTaskContext(context) {
    const ctx = super.extendTaskContext(context)
    ctx.resolveUrl = async id => this.__vitest_executor.resolveUrl(id)
    ctx.fetchModule = async id => this.__vitest_executor.options.fetchModule(id)
    return ctx
  }
}
