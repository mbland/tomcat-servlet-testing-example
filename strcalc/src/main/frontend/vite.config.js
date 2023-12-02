import handlebarsPrecompiler from './rollup-plugin-handlebars-precompiler.js'
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import path from 'node:path/posix'

const BUILD_DIR = path.resolve('../../../build/')

export function buildDir(relativePath) {
  return path.resolve(BUILD_DIR, relativePath)
}

export default defineConfig({
  base: '/strcalc',
  plugins: [
    handlebarsPrecompiler({
      helpers: ['components/helpers.js'],
      sourcemap: true
    })
  ],
  build: {
    outDir: buildDir('webapp'),
    sourcemap: true
  },
  css: {
    devSourcemap: true
  },
  test: {
    outputFile: buildDir('test-results/test-frontend/TESTS-TestSuites.xml'),
    coverage: {
      reportsDirectory: buildDir('reports/frontend/coverage'),
      // Remove 'exclude:' once rollup-plugin-handlebars-precompile moves
      // into its own repository.
      exclude: [
        ...configDefaults.coverage.exclude,
        'rollup-plugin-handlebars-precompiler.js'
      ]
    },
    browser: {
      name: 'chrome'
    }
  }
})
