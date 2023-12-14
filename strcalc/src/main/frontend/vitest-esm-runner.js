/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { VitestTestRunner } from 'vitest/runners'
import vm from 'node:vm'

export default class VitestEsmRunner extends VitestTestRunner {
  constructor(...args) {
    super(...args)
  }

  extendTaskContext(context) {
    const ctx = super.extendTaskContext(context)
    ctx.executeId = async (id, vmCtx) => {
      const executor = this.__vitest_executor
      const origCtx = executor.options.context
      executor.options.context = vmCtx

      const mod = await executor.executeId(id)
      executor.options.context = origCtx
      return mod
    }
    return ctx
  }
}
