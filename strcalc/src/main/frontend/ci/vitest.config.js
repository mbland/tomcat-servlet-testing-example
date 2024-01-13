import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from '../vite.config.js'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    reporters: [ 'junit', 'default' ],
    coverage: {
      enabled: true,
      reporter: ['text', 'lcovonly']
    }
  }
}))
