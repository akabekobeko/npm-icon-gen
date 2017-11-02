#!/usr/bin/env node

import CLI from './cli-util.js'
import IconGen from '../lib/index.js'

/**
 * Main process.
 *
 * @param {CLIOptions} options Options.
 *
 * @return {Promise} Promise object.
 */
function execute (options) {
  return new Promise((resolve, reject) => {
    if (!(options.input)) {
      return reject(new Error('"-i" or "--input" has not been specified. This parameter is required.'))
    }

    if (!(options.output)) {
      return reject(new Error('"-o" or "--output" has not been specified. This parameter is required.'))
    }

    return IconGen(options.input, options.output, options)
  })
}

/**
 * Entry point of the CLI.
 *
 * @param {Array.<String>} argv   Arguments of the command line.
 * @param {WritableStream} stdout Standard output.
 *
 * @return {Promise} Promise object.
 */
function main (argv, stdout) {
  const options = CLI.parse(argv)
  if (options.help) {
    return CLI.showHelp(stdout)
  } else if (options.version) {
    return CLI.showVersion(stdout)
  }

  return execute(options)
}

main(process.argv.slice(2), process.stdout)
  .then()
  .catch((err) => {
    console.error(err)
  })
