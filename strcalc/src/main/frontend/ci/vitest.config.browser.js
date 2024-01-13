import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig, { buildDir } from '../vite.config.js'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    outputFile: buildDir('test-results/test-frontend-browser/' +
      'TESTS-TestSuites.xml'),
    reporters: [ 'junit', 'default' ],
    browser: {
      enabled: true,
      headless: true,
      name: 'chrome'
    }
  }
}))
