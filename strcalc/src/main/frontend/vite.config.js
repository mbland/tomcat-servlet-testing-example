import { defineConfig } from 'vite'
import path from 'node:path/posix'

const BUILD_DIR = path.resolve('../../../build/')

export function buildDir(relativePath) {
  return path.resolve(BUILD_DIR, relativePath)
}

export default defineConfig({
  base: '/strcalc',
  build: {
    outDir: buildDir('webapp')
  },
  test: {
    outputFile: buildDir('test-results/test-frontend/TESTS-TestSuites.xml'),
    coverage: {
      reportsDirectory: buildDir('reports/frontend/coverage')
    },
    browser: {
      name: 'chrome'
    }
  }
})
