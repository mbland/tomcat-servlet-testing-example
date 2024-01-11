import HandlebarsPrecompiler from 'rollup-plugin-handlebars-precompiler'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path/posix'

const BUILD_DIR = path.resolve('../../../build/')

/**
 * Resolves a file system path relative to the project's BUILD_DIR.
 * @private
 * @param {string} relativePath path within the BUILD_DIR to construct
 * @returns {string} the relativePath resolved to BUILD_DIR
 */
export function buildDir(relativePath) {
  return path.resolve(BUILD_DIR, relativePath)
}

const ARM64_LINUX_WARNING = [
  '',
  'WARNING:',
  '-------',
  'Neither Google Chrome nor Chrome for Testing are available for arm64 Linux.',
  'Also, the snap versions of Chromium, Chromedriver, and Firefox are not',
  'controllable by the webdriverio npm. For these reasons, you will need to',
  'install non-snap versions of Chromium and/or Firefox to run the browser',
  'tests.',
  '',
  'Some guidance for doing so on Ubuntu is available at:',
  '- https://askubuntu.com/questions/1179273/how-to-remove-snap-completely-without-losing-the-chromium-browser/1206502#1206502',
  '- https://www.omgubuntu.co.uk/2022/04/how-to-install-firefox-deb-apt-ubuntu-22-04',
  '',
  'Note that this may also require upgrading to at least Ubuntu 23.10, as it',
  'will have more recent dependency updates that Chromium depends upon.',
  ''
]

/**
 * Configures browser tests to use Chromium on arm64 Linux
 *
 * Emits a warning and some suggestions if the system is arm64 Linux and
 * /usr/bin/chromium is missing.
 *
 * Returns undefined if the system isn't arm64 Linux or if /usr/bin/chromium
 * is missing.
 * @returns {object | undefined} Chromium providerOptions or undefined
 */
function getProviderOptions(){
  if (os.arch() !== 'arm64' || os.platform() !== 'linux') {
    return
  } else if (fs.existsSync('/usr/bin/chromium')) {
    return {
      capabilities: {
        browserName: 'chromium',
        'wdio:chromedriverOptions': {
          binary: '/usr/bin/chromedriver'
        },
        'goog:chromeOptions': {
          binary: '/usr/bin/chromium'
        }
      }
    }
  }
  console.warn(ARM64_LINUX_WARNING.join('\n'))
}

export default defineConfig({
  base: '/strcalc/',
  plugins: [
    HandlebarsPrecompiler({ helpers: ['components/helpers.js'] })
  ],
  define: {
    STRCALC_BACKEND: JSON.stringify(process.env.STRCALC_BACKEND)
  },
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
      reportsDirectory: buildDir('reports/frontend/coverage')
    },
    server: {
      deps: {
        // Without this, jsdom tests will fail to import '.hbs' files
        // transformed by rollup-plugin-handlebars-precompiler.
        inline: ['test-page-opener']
      }
    },
    browser: {
      name: 'chrome',
      providerOptions: getProviderOptions()
    }
  }
})
