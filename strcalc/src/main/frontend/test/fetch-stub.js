/* eslint-env browser, node */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {vi} from 'vitest'

/**
 * Stubs the global fetch() with a vi.fn() configured with a Response
 *
 * Use `afterEach(() => { vi.unstubAllGlobals() })` to clean up this stub
 * after every test.
 * @see https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch
 * @see https://developer.mozilla.org/docs/Web/API/Response/Response
 * @param {object} body - an object defining a body for the response
 * @param {object} options - optional values to include in the response
 * @param {object} options.status - HTTP status code of the response
 * @param {object} options.statusText - text accompanying the status response
 * @param {object} options.headers - HTTP Headers to include with the response
 * @returns {Function} - a vi.fn() stub configured to return a Response once
 */
export default function setupFetchStub(body, options) {
  const fetchStub = vi.fn()

  fetchStub.mockReturnValueOnce(Promise.resolve(new Response(body, options)))
  vi.stubGlobal('fetch', fetchStub)
  return fetchStub
}
