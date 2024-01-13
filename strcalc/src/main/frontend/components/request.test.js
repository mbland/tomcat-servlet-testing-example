/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { post, postFormData, postOptions } from './request.js'
import { afterEach, describe, expect, test, vi } from 'vitest'
import setupFetchStub from '../test/fetch-stub.js'

// @vitest-environment jsdom
describe('Request', () => {
  const req = { want: 'foo' }

  afterEach(() => { vi.unstubAllGlobals() })

  describe('post', () => {
    test('succeeds', async () => {
      const res = { foo: 'bar' }
      const fetchStub = setupFetchStub(res)

      await expect(post('/fetch', req)).resolves.toEqual(res)
      expect(fetchStub).toHaveBeenCalledWith('/fetch', postOptions(req))
    })

    test('rejects with an error if the response contains "error"', async () => {
      const res = { error: 'OK status, but still an error' }
      setupFetchStub(res)

      await expect(post('/fetch', req)).rejects.toThrow(res.error)
    })

    test('rejects with an error if the response status is not OK', async () => {
      const res = 'totally our fault'
      setupFetchStub(res, { status: 500 })

      await expect(post('/fetch', req)).rejects.toThrow(res)
    })

    test('rejects with default status text if no response body', async () => {
      setupFetchStub('', { status: 500, statusText: 'Internal Server Error' })

      await expect(post('/fetch', req))
        .rejects.toThrow('500: Internal Server Error')
    })
  })

  describe('postFormData', () => {
    test('succeeds', async () => {
      const fd = new FormData()
      const res = { foo: 'bar' }
      const fetchStub = setupFetchStub(res)
      Object.entries(req).forEach(([k,v]) => fd.append(k,v))

      await expect(postFormData('/fetch', fd)).resolves.toEqual(res)
      expect(fetchStub).toHaveBeenCalledWith('/fetch', postOptions(req))
    })
  })
})
