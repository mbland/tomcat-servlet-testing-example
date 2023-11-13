const BUILD_DIR = '../../../build/'
export default {
  base: '/strcalc',
  build: {
    outDir: BUILD_DIR + 'webapp'
  },
  test: {
    outputFile: BUILD_DIR + 'test-results/test-frontend/TESTS-TestSuites.xml',
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: BUILD_DIR + 'reports/frontend/coverage'
    }
  }
}
