import Path from 'path'
import IconGen from '../lib/index.js'

/**
 * Text of help.
 * @type {String}
 */
const HELP_TEXT = `
Usage: icon-gen [OPTIONS]

Generate an icon from the SVG or PNG file.
If '--ico', '--icns', '--favicon' is not specified, everything is output in the standard setting.

Options:
-h, --help    Display this text.
-v, --version Display the version number.
-i, --input   Path of the SVG file or PNG file directory.
-o, --output  Path of the output directory.
-r, --report  Display the process reports.
              Default is disable.
--ico         Output ICO file with the specified 'name' and 'sizes'.
              ex. --ico name=foo sizes=16,32,128
--icns        Output ICO file with the specified 'name' and 'sizes'.
              ex. --icns name=bar sizes=32,1024
--favicon     Output Favicon files with the specified 'ico', 'name' and 'sizes'.
              'ico' is the size of the ICO file.
              'name' is the prefix of the PNG file. Start with the alphabet, can use '-' and '_'.
              'sizes' is the size of the PNG file.
              ex. '--favicon ico=16,32 name=favicon- sizes=16,32,128'

-s, --sizes   List of sizes to include for ICO and ICNS.
          ex: 'ico=[12,24,32],icns=[12,24,64]'

Examples:
$ icon-gen -i sample.svg -o ./dist -r
$ icon-gen -i ./images -o ./dist -r
$ icon-gen -i sample.svg -o ./dist --ico --icns
$ icon-gen -i sample.svg -o ./dist --ico --favicon ico=16,32 name=favicon- sizes=16,32,128

See also:
https://github.com/akabekobeko/npm-icon-gen
`

/**
 * CLI parameters.
 * @type {Object}
 */
const CLI_PARAMS = {
  help: { name: '--help', shortName: '-h' },
  version: { name: '--version', shortName: '-v' },
  input: { name: '--input', shortName: '-i' },
  output: { name: '--output', shortName: '-o' },
  report: { name: '--report', shortName: '-r' },
  ico: { name: '--ico' },
  icns: { name: '--icns' },
  favicon: { name: '--favicon' }
}

/**
 * Parse an option of argument.
 * @param {String} arg Option of argument. Format is "value" of "name=value".
 * @returns {String|Object} Parsed option.
 */
const parseArgOption = (arg) => {
  const units = arg.split('=')
  if (1 < units.length) {
    return { name: units[0], value: units[1] }
  } else {
    return arg
  }
}

/**
 * Parse an arguments of command line.
 * @param {String[]} argv Arguments of command line.
 * @returns {Object[]} Paesed parameters.
 */
const parseArgv = (argv) => {
  const results = []
  let param = { name: '', options: [] }
  argv.forEach((arg) => {
    if (arg.startsWith('-')) {
      param = { name: arg, options: [] }
      results.push(param)
    } else {
      param.options.push(parseArgOption(arg))
    }
  })

  return results
}

/**
 * Parse the options of the image.
 * @param {Object} options Parsed options from parseArgOption function.
 * @returns {Object} Options.
 */
const parseImageOption = (options) => {
  const result = {}
  options.forEach((option) => {
    switch (option.name) {
      case 'name':
        result.name = option.value
        break

      case 'sizes':
        result.sizes = option.value.split(',').map((n) => Number(n))
        break

      // Favicon only
      case 'ico':
        result.ico = option.value.split(',').map((n) => Number(n))
        break

      default:
        break
    }
  })

  return result
}

const parse = (argv) => {
  if (!(argv && 0 < argv.length)) {
    return { help: true }
  }

  switch (argv[0]) {
    case CLI_PARAMS.help.name:
    case CLI_PARAMS.help.shortName:
      return { help: true }

    case CLI_PARAMS.version.name:
    case CLI_PARAMS.version.shortName:
      return { version: true }

    default:
      break
  }

  const options = {}
  parseArgv(argv).forEach((arg) => {
    switch (arg.name) {
      case CLI_PARAMS.input.name:
      case CLI_PARAMS.input.shortName:
        options.input = arg.options.length === 0 ? '' : Path.resolve(arg.options[0])
        break

      case CLI_PARAMS.output.name:
      case CLI_PARAMS.output.shortName:
        options.output = arg.options.length === 0 ? '' : Path.resolve(arg.options[0])
        break

      case CLI_PARAMS.report.name:
      case CLI_PARAMS.report.shortName:
        options.report = true
        break

      case CLI_PARAMS.ico.name:
        options.ico = parseImageOption(arg.options)
        break

      case CLI_PARAMS.icns.name:
        options.icns = parseImageOption(arg.options)
        break

      case CLI_PARAMS.favicon.name:
        options.favicon = parseImageOption(arg.options)
        break

      default:
        break
    }
  })

  // Generate all if all images are omitted
  if (!options.ico && !options.icns && !options.favicon) {
    options.ico = {}
    options.icns = {}
    options.favicon = {}
  }

  return options
}

/**
 * Show the help text.
 * @param {WritableStream} stream Target stream.
 * @return {Promise} Asynchronous task..
 */
const printHelp = (stream) => {
  return new Promise((resolve) => {
    stream.write(HELP_TEXT)
    resolve()
  })
}

/**
 * Show the version number.
 * @param {WritableStream} stream Target stream.
 * @return {Promise} Asynchronous task..
 */
const printVersion = (stream) => {
  return new Promise((resolve) => {
    const read = (path) => {
      try {
        return require(path).version
      } catch (err) {
        return null
      }
    }

    const version = read('../package.json') || read('../../package.json')
    stream.write('v' + version + '\n')

    resolve()
  })
}

/**
 * Entry point of the CLI.
 * @param {String[]} argv Arguments of the command line.
 * @param {WritableStream} stdout Standard output.
 * @return {Promise} Asynchronous task.
 */
const CLI = (argv, stdout) => {
  return new Promise((resolve, reject) => {
    const options = parse(argv)
    if (options.help) {
      printHelp(stdout)
      return resolve()
    }

    if (options.version) {
      printVersion(stdout)
      return resolve()
    }

    if (!options.input) {
      return reject(new Error('"-i" or "--input" has not been specified. This parameter is required.'))
    }

    if (!options.output) {
      return reject(new Error('"-o" or "--output" has not been specified. This parameter is required.'))
    }

    return IconGen(options.input, options.output, options)
  })
}

export default CLI
