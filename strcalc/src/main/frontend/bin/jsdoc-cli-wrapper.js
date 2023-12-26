#!/usr/bin/env node
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * @file JSDoc command line interface wrapper.
 *
 * Removes the existing destination directory if it exists, runs JSDoc, and
 * emits the relative path to the generated index.html file.
 * @author Mike Bland <mbland@acm.org>
 */

import { spawn } from 'node:child_process'
import { access, readdir, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { exit, stdout } from 'node:process'

try {
  const jsdocArgs = process.argv.slice(2)
  const {exitCode, indexHtml} = await runJsdoc(jsdocArgs, process.env)
  if (indexHtml !== undefined) stdout.write(`${indexHtml}\n`)
  exit(exitCode)

} catch (err) {
  console.error(err)
  exit(1)
}

/**
 * Result of the `jsdoc` execution
 * @typedef {object} RunJsdocResults
 * @property {number} exitCode - 0 on success, nonzero on failure
 * @property {string} indexHtml - path to the generated index.html file
 */

/**
 * Removes the existing JSDoc directory, runs `jsdoc`, and emits the result path
 * @param {string[]} argv - JSDoc command line interface arguments
 * @param {object} env - environment variables, presumably process.env
 * @returns {Promise<RunJsdocResults>} - result of `jsdoc` execution
 */
async function runJsdoc(argv, env) {
  let jsdocPath

  try {
    jsdocPath = await getPath('jsdoc', env)
  } catch {
    return Promise.reject(
      'Run \'pnpm add -g jsdoc\' to install JSDoc: https://jsdoc.app\n'
    )
  }

  const {destination, willGenerate} = await analyzeArgv(argv)

  if (willGenerate) await rm(destination, {force: true, recursive: true})

  const exitCode = await new Promise(resolve => {
    spawn(jsdocPath, argv, {stdio: 'inherit'})
      .on('close', code => resolve(code))
  })

  try {
    if (exitCode === 0 && willGenerate) {
      return {exitCode, indexHtml: await findFile(destination, 'index.html')}
    }
  } catch {
    // If jsdoc finds no input files, it won't create the destination directory.
    // It will print "There are no input files to process." and exit with 0.
  }
  return {exitCode}
}

/**
 * Returns the full path to the specified command
 * @param {string} cmdName - command to find in env.PATH
 * @param {object} env - environment variables, presumably process.env
 * @param {string} env.PATH - the PATH environment variable
 * @returns {Promise<string>} - path to the command
 */
async function getPath(cmdName, env) {
  for (const p of env.PATH.split(path.delimiter)) {
    const candidate = path.join(p, cmdName)
    try {
      await access(candidate)
      return candidate
    } catch { /* try next candidate */ }
  }
  return Promise.reject(`${cmdName} not found in PATH`)
}

/**
 * Results from analyzing JSDoc command line arguments
 * @typedef {object} ArgvResults
 * @property {string} destination - the JSDoc destination directory
 * @property {boolean} willGenerate - true unless --help or --version present
 */

/**
 * Analyzes JSDoc CLI args to determine if JSDoc will generate docs and where
 * @param {string[]} argv - JSDoc command line interface arguments
 * @returns {Promise<ArgvResults>} - analysis results
 */
async function analyzeArgv(argv) {
  let destination = undefined
  let willGenerate = true
  let cmdLineDest = false

  for (let i = 0; i !== argv.length; ++i) {
    const arg = argv[i]
    const nextArg = argv[i+1]
    let config = null

    switch (arg) {
    case '-c':
    case '--configure':
      if (!cmdLineDest && nextArg !== undefined) {
        config = JSON.parse(await readFile(nextArg))
        if (config.opts !== undefined) {
          destination = config.opts.destination
        }
      }
      break

    case '-d':
    case '--destination':
      if (nextArg !== undefined && !nextArg.startsWith('-')) {
        destination = nextArg
        cmdLineDest = true
      }
      break

    case '-h':
    case '--help':
    case '-v':
    case '--version':
      willGenerate = false
      break
    }
  }

  // "out" is the JSDoc default directory.
  destination ??= 'out'
  return {willGenerate, destination}
}

/**
 * Searches for filename within a directory tree via breadth-first search
 * @param {string} dirname - current directory to search
 * @param {string} filename - name of file to find
 * @returns {Promise<string>} - path to filename within dirname
 */
async function findFile(dirname, filename) {
  const childDirs = [dirname]
  let curDir

  while ((curDir = childDirs.shift()) !== undefined) {
    // This should be `for await (const entry of readdir(...))`:
    //
    // - https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/for-await...of
    //
    // But Node 20.10.0 errors with:
    //
    //   TypeError: readdir(...) is not a function or its return value is not
    //   async iterable
    const entries = await readdir(curDir, {withFileTypes: true})
    for (const entry of entries) {
      const childPath = path.join(curDir, entry.name)
      if (entry.name === filename) return childPath
      if (entry.isDirectory()) childDirs.push(childPath)
    }
  }
  return Promise.reject(`failed to find ${filename} in ${dirname}`)
}
