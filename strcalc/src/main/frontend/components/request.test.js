/* eslint-env browser, node, jest, vitest */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { post, postForm, postOptions } from './request'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { resolvedUrl } from '../test/helpers'

// @vitest-environment jsdom
describe('Request', () => {
  const req = { want: 'foo' }

  const setupFetchStub = (body, options) => {
    const fetchStub = vi.fn()

    fetchStub.mockReturnValueOnce(Promise.resolve(new Response(body, options)))
    vi.stubGlobal('fetch', fetchStub)
    return fetchStub
  }

  afterEach(() => { vi.unstubAllGlobals() })

  describe('post', () => {
    test('succeeds', async () => {
      const res = { foo: 'bar' }
      const fetchStub = setupFetchStub(JSON.stringify(res))

      await expect(post('/fetch', req)).resolves.toEqual(res)
      expect(fetchStub).toHaveBeenCalledWith('/fetch', postOptions(req))
    })

    test('rejects with an error if the response contains "error"', async () => {
      const res = { error: 'OK status, but still an error' }
      setupFetchStub(JSON.stringify(res))

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

  describe('postForm', () => {
    test('succeeds', async () => {
      // We have to be careful creating the <form>, because form.action resolves
      // differently depending on how we created it.
      //
      // Originally I tried creating it using fragment() from '../test/helpers',
      // which creates elements using a new <template> containing a
      // DocumentFragment. However, the elements in that DocumentFragment are in
      // a separate DOM. This caused the <form action="/fetch"> attribute to be:
      //
      // - '/fetch' in jsdom
      // - '' in Chrome
      // - `#{document.location.origin}/fetch` in Firefox
      //
      // Creating a <form> element via document.createElement() as below
      // causes form.action to become `#{document.location.origin}/fetch` in
      // every environment.
      const form = document.createElement('form')
      const resolvedAction = resolvedUrl('./fetch')
      const res = { foo: 'bar' }
      const fetchStub = setupFetchStub(JSON.stringify(res))

      form.action = '/fetch'
      form.innerHTML = '<input type="text" name="want" id="want" value="foo" />'

      expect(form.action).toBe(resolvedAction)
      await expect(postForm(form)).resolves.toEqual(res)
      expect(fetchStub).toHaveBeenCalledWith(resolvedAction, postOptions(req))
    })
  })
})
