/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Posts the data from a <form> via fetch() and returns the response object
 * @see https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/
 * @param {FormData} form - form containing data to POST
 * @returns {Promise<any>} - response from the server
 */
export async function postForm(form) {
  return post(form.action, Object.fromEntries(new FormData(form).entries()))
}

/**
 * Posts an object payload via fetch() and returns the response object
 * @param {string} url - address of server request
 * @param {object} payload - data to include in the POST request
 * @returns {Promise<any>} - response from the server
 */
export async function post(url, payload) {
  const res = await fetch(url, postOptions(payload))
  const body = await res.text()

  if (body.startsWith('{') && body.includes('"error":'))  {
    throw new Error(JSON.parse(body).error)
  } else if (!res.ok) {
    const msg = body.length !== 0 ? body : `${res.status}: ${res.statusText}`
    throw new Error(msg)
  }
  return JSON.parse(body)
}

/**
 * Prepares the fetch() options for an application/json POST request
 * @param {object} payload - data to include in the POST request options
 * @returns {object} - an options object for a fetch() POST request
 */
export function postOptions(payload) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  }
}
