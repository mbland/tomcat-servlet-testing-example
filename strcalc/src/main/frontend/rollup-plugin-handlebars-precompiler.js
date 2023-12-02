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

const PLUGIN_NAME = 'handlebars-precompiler'
const DEFAULT_INCLUDE = ['**/*.hbs', '**/*.handlebars', '**/*.mustache']
const DEFAULT_EXCLUDE = 'node_modules/**'
const DEFAULT_PARTIALS = '**/_*'
const DEFAULT_PARTIAL_NAME = id => {
  return id.replace(/.*\//, '')    // extract the basename
    .replace(/\.[^.]*$/, '')       // remove the file extension, if present
    .replace(/^[^[:alnum:]]*/, '') // strip leading non-alphanumeric characters
}
const DEFAULT_PARTIAL_PATH = (partialName, importerPath) => {
  return `./_${partialName}.${importerPath.replace(/.*\./, '')}`
}

const PLUGIN_ID = `\0${PLUGIN_NAME}`
const HANDLEBARS_PATH = 'handlebars/lib/handlebars.runtime'
const IMPORT_HANDLEBARS = `import Handlebars from '${HANDLEBARS_PATH}'`
const IMPORT_HELPERS = `import '${PLUGIN_ID}'`

// eslint-disable-next-line @stylistic/js/max-len
// https://github.com/handlebars-lang/handlebars.js/blob/master/docs/compiler-api.md
class PartialCollector extends Handlebars.Visitor {
  partials = []

  PartialStatement(partial) {
    this.collect(partial.name)
    return super.PartialStatement(partial)
  }

  PartialBlockStatement(partial) {
    this.collect(partial.name)
    return super.PartialBlockStatement(partial)
  }

  collect(n) { if (n.type === 'PathExpression') this.partials.push(n.original) }
}

class PluginImpl {
  #helpers
  #isTemplate
  #isPartial
  #partialName
  #partialPath
  #compilerOpts

  constructor(options = {}) {
    this.#helpers = options.helpers || []
    this.#isTemplate = createFilter(
      options.include || DEFAULT_INCLUDE,
      options.exclude || DEFAULT_EXCLUDE
    )
    this.#isPartial = createFilter(options.partials || DEFAULT_PARTIALS)
    this.#partialName = options.partialName || DEFAULT_PARTIAL_NAME
    this.#partialPath = options.partialPath || DEFAULT_PARTIAL_PATH

    if (options.compiler) {
      delete options.compiler.srcName
      delete options.compiler.destName
    }
    this.#compilerOpts = options.sourcemap ?
      (id) => Object.assign({ srcName: id }, options.compiler) :
      () => options.compiler
  }

  shouldEmitHelpersModule(id) { return id === PLUGIN_ID && this.#hasHelpers() }
  isTemplate(id) { return this.#isTemplate(id) }

  helpersModule() {
    const helpers = this.#helpers
    return [
      IMPORT_HANDLEBARS,
      ...helpers.map((h, i) => `import registerHelpers${i} from './${h}'`),
      ...helpers.map((_, i) => `registerHelpers${i}(Handlebars)`)
    ].join('\n')
  }

  compile(code, id) {
    const opts = this.#compilerOpts(id)
    const ast = Handlebars.parse(code, opts)
    const compiled = Handlebars.precompile(ast, opts)
    const { code: tmpl = compiled, map: srcMap = null } = compiled
    const collector = new PartialCollector()
    collector.accept(ast)

    const preTmpl = [
      IMPORT_HANDLEBARS,
      ...(this.#hasHelpers() ? [ IMPORT_HELPERS ] : []),
      ...collector.partials.map(p => `import '${this.#partialPath(p, id)}'`),
      'const Template = Handlebars.template('
    ]
    const postTmpl = [
      ')',
      // The trailing ';' prevents source map loss if it's the last line.
      'export default Template;',
      ...(this.#isPartial(id) ? [ this.#partialRegistration(id) ] : [])
    ]
    return {
      code: [ ...preTmpl, tmpl, ...postTmpl ].join('\n'),
      map: srcMap ? this.#adjustSourceMap(srcMap, preTmpl.length) : null
    }
  }

  #hasHelpers() { return this.#helpers.length }

  #adjustSourceMap(map, preTmplLen) {
    const result = JSON.parse(map)
    result.mappings = `${';'.repeat(preTmplLen)}${result.mappings}`
    return result
  }

  #partialRegistration(id) {
    return `Handlebars.registerPartial('${this.#partialName(id)}', Template)`
  }
}

export default function(options) {
  const p = new PluginImpl(options)
  return {
    name: PLUGIN_NAME,
    resolveId(id) { if (p.shouldEmitHelpersModule(id)) return id },
    load(id) { if (p.shouldEmitHelpersModule(id)) return p.helpersModule() },
    transform(code, id) { if (p.isTemplate(id)) return p.compile(code, id) }
  }
}
