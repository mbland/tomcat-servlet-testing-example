/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export default function(Handlebars) {
  // Adapted from: https://handlebarsjs.com/guide/expressions.html#helpers
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
