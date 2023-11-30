/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * This is an example of a custom Handlebars helper, adapted directly from:
 * - https://handlebarsjs.com/guide/expressions.html#helpers
 */

export default function(Handlebars) {
  Handlebars.registerHelper('link', function(text, options) {
    const attrs = Object.keys(options.hash).map(key => {
      return `${Handlebars.escapeExpression(key)}=` +
        `"${Handlebars.escapeExpression(options.hash[key])}"`
    })
    return new Handlebars.SafeString(
      `<a ${attrs.join(' ')}>${Handlebars.escapeExpression(text)}</a>`
    )
  })
}
