// Original work Copyright (c) 2016 Benjamin Legrand under the MIT License
// https://github.com/benjilegnard/rollup-plugin-handlebars
//
// Original work Copyright (c) 2016 Mixmax, Inc under the MIT License
// https://github.com/mixmaxhq/rollup-plugin-handlebars-plus
//
// Modified work Copyright (c) 2023 Mike Bland <mbland@acm.org> under the
// Mozilla Public License Version 2.0
//
// MIT License
// -----------
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// Mozilla Public License Version 2.0
// ----------------------------------
// This Source Code Form is subject to the terms of the Mozilla Public License,
// v. 2.0. If a copy of the MPL was not distributed with this file, You can
// obtain one at https://mozilla.org/MPL/2.0/.

import { createFilter } from '@rollup/pluginutils'
import Handlebars from 'handlebars'

const PLUGIN_NAME = 'handlebars-precompile'
const DEFAULT_INCLUDE = ['**/*.hbs', '**/*.handlebars', '**/*.mustache']
const DEFAULT_EXCLUDE = 'node_modules/**'

const PLUGIN_ID = `\0${PLUGIN_NAME}`
const HANDLEBARS_PATH = 'handlebars/lib/handlebars.runtime'
const IMPORT_HANDLEBARS = `import Handlebars from '${HANDLEBARS_PATH}'`
const IMPORT_HELPERS = `import '${PLUGIN_ID}'`

class PluginImpl {
  #options
  #helpers
  #isTemplate

  constructor(options = {}) {
    this.#options = options
    this.#helpers = options.helpers || []
    this.#isTemplate = createFilter(
      options.include || DEFAULT_INCLUDE,
      options.exclude || DEFAULT_EXCLUDE
    )
  }

  shouldEmitHelpersModule(id) {
    return id === PLUGIN_ID && this.#helpers.length
  }

  helpersModule() {
    const helpers = this.#helpers
    return [
      IMPORT_HANDLEBARS,
      ...helpers.map((h, i) => `import registerHelpers${i} from './${h}'`),
      ...helpers.map((_, i) => `registerHelpers${i}(Handlebars)`)
    ].join('\n')
  }

  isTemplate(id) { return this.#isTemplate(id) }

  compiledModule(code) {
    const compOpts = this.#options.compiler
    const ast = Handlebars.parse(code, compOpts)
    const tmpl = Handlebars.precompile(ast, compOpts)

    return {
      code: [
        IMPORT_HANDLEBARS,
        ...(this.#helpers.length ? [ IMPORT_HELPERS ] : []),
        `const Template = Handlebars.template(${tmpl.toString()})`,
        'export default Template'
      ].join('\n')
    }
  }
}

export default function(options) {
  const p = new PluginImpl(options)

  return {
    name: PLUGIN_NAME,
    resolveId(id) { if (p.shouldEmitHelpersModule(id)) return id },
    load(id) { if (p.shouldEmitHelpersModule(id)) return p.helpersModule() },
    transform(code, id) { if (p.isTemplate(id)) return p.compiledModule(code) }
  }
}
