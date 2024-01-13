/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import TestPageOpener from 'test-page-opener'

const inBrowser = globalThis.window !== undefined

describe.skipIf(inBrowser)('String Calculator UI missing root element', () => {
  /** @type {TestPageOpener} */
  let opener

  beforeAll(async () => {opener = await TestPageOpener.create('/strcalc/')})
  afterEach(() => opener.closeAll())

  test('logs error if missing app div', async () => {
    const pagePath = 'test/missing.html'
    const consoleSpy = vi.spyOn(console, 'error')
      .mockImplementationOnce(() => {})

    const { close } = await opener.open(pagePath)
    close()

    expect(consoleSpy).toBeCalledWith('missing #app element')
  })
})
