/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { default as calculators, DEFAULT_ENDPOINT } from './calculators'
import { afterEach, describe, expect, test, vi } from 'vitest'
import setupFetchStub from '../test/fetch-stub'
import { postOptions } from './request'

describe('calculators', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  test('defaultPost requests expected backend', async () => {
    const data = new FormData()
    const fetchStub = setupFetchStub(JSON.stringify({ ok: true }))
    data.append('want', 'status')

    await expect(calculators.api.impl(data)).resolves.toEqual({ ok: true })
    expect(fetchStub).toHaveBeenCalledWith(
      DEFAULT_ENDPOINT, postOptions({ want: 'status' }))
  })
})
