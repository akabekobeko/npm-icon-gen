import Path from 'path'
import IconGen from '../lib/index.js'

/**
 * Text of help.
 * @type {String}
 */
const HELP_TEXT = `
Usage: icon-gen [OPTIONS]

Generate an icon from the SVG or PNG file.

Options:
-h, --help    Display this text.
-v, --version Display the version number.
-i, --input   Path of the SVG file or PNG file directory.
-o, --output  Path of the output directory.
-t, --type    Type of the input file.
              'svg' is the SVG file, 'png' is the PNG files directory.
              Allowed values: svg, png
              Default is 'svg'.
-m, --modes   Mode of the output files.
              Allowed values: ico, icns, favicon, all
              Default is 'all'.
-n, --names   Change an output file names for ICO and ICNS.
              ex: 'ico=foo,icns=bar'
              Default is 'app.ico' and 'app.ico'.
-r, --report  Display the process reports.
              Default is disable.
-s, --sizes   List of sizes to include for ICO and ICNS.
              ex: 'ico=[12,24,32],icns=[12,24,64]'

-s, --sizes   List of sizes to include for ICO and ICNS.
          ex: 'ico=[12,24,32],icns=[12,24,64]'

Examples:
$ icon-gen -i sample.svg -o ./dist -r
$ icon-gen -i ./images -o ./dist -t png -r
$ icon-gen -i sample.svg -o ./dist -m ico,favicon -r
$ icon-gen -i sample.svg -o ./dist -n ico=foo,icns=bar
$ icon-gen -i sample.svg -o ./dist -s ico=[16,24,32],icns=[16,32,512]

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
  type: { name: '--type', shortName: '-t' },
  modes: { name: '--modes', shortName: '-m' },
  sizes: { name: '--sizes', shortName: '-s' },
  names: { name: '--names', shortName: '-n' },
  report: { name: '--report', shortName: '-r' }
}

/**
 * Types of the source file.
 * @type {Object}
 */
const SOURCE_TYPES = {
  svg: 'svg',
  png: 'png'
}

/**
 * Output file modes.
 * @type {Object}
 */
const OUTPUT_MODES = {
  ico: 'ico',
  icns: 'icns',
  favicon: 'favicon',
  all: ['ico', 'icns', 'favicon']
}

/**
 * Default command line options.
 * @type {Object}
 */
export const DEFAULT_OPTIONS = {
  type: SOURCE_TYPES.svg,
  modes: OUTPUT_MODES.all,
  names: {
    ico: 'app',
    icns: 'app'
  },
  report: false
}

/**
 * Parse the input file sizes.
 * @param {String} arg Option. Format is a 'ico=[16,24,32],icns=[16,24,32]'.
 * @return {Object} File sizes.
 */
const parseSizes = (arg) => {
  const sizes = {}
  if (!(typeof arg === 'string')) {
    return sizes
  }

  const regexp = new RegExp(/((ico|icns)=\[[0-9,]+\])/g)
  const params = arg.match(regexp)
  params.forEach((param) => {
    const units = param.split('=')
    if (units.length < 2) {
      return
    }

    const key = units[0]
    const values = units[1].match(/\[([0-9,]+)\]/)[1].split(',')
    switch (key) {
      case OUTPUT_MODES.ico:
      case OUTPUT_MODES.icns:
        sizes[key] = values.map((value) => Number(value))
        break

      default:
        break
    }
  })

  return sizes
}

/**
 * Parse the output file names.
 * @param {String} arg Option. Format is a 'ico=foo,icns=bar'.
 * @return {Object} File names.
 */
const parseNames = (arg) => {
  const names = {}
  if (!(typeof arg === 'string')) {
    return names
  }

  const params = arg.split(',')
  params.forEach((param) => {
    const units = param.split('=')
    if (units.length < 2) {
      return
    }

    const key = units[0]
    const value = units[1]
    switch (key) {
      case OUTPUT_MODES.ico:
      case OUTPUT_MODES.icns:
        names[key] = value
        break

      default:
        break
    }
  })

  return names
}

/**
 * Parse for the mode option.
 * @param {String} arg Option. Format is a 'all' or 'ico,icns,favicon'.
 * @return {String[]} Parse results.
 */
const parseMode = (arg) => {
  if (!arg) {
    return OUTPUT_MODES.all
  }

  const values = arg.split(',').filter((value) => {
    switch (value) {
      case OUTPUT_MODES.ico:
      case OUTPUT_MODES.icns:
      case OUTPUT_MODES.favicon:
        return true

      default:
        return false
    }
  })

  return 0 < values.length ? values : OUTPUT_MODES.all
}

/**
 * Parse for the command line argumens.
 * @param {String[]} argv Arguments of the command line.
 * @return {CLIOptions} Parse results.
 */
const parseArgv = (argv) => {
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
  argv.forEach((arg, index) => {
    switch (arg) {
      case CLI_PARAMS.input.name:
      case CLI_PARAMS.input.shortName:
        if (index + 1 < argv.length) {
          options.input = Path.resolve(argv[index + 1])
        }
        break

      case CLI_PARAMS.output.name:
      case CLI_PARAMS.output.shortName:
        if (index + 1 < argv.length) {
          options.output = Path.resolve(argv[index + 1])
        }
        break

      case CLI_PARAMS.type.name:
      case CLI_PARAMS.type.shortName:
        if (index + 1 < argv.length) {
          options.type = argv[index + 1]
        }
        break

      case CLI_PARAMS.report.name:
      case CLI_PARAMS.report.shortName:
        options.report = true
        break

      case CLI_PARAMS.modes.name:
      case CLI_PARAMS.modes.shortName:
        if (index + 1 < argv.length) {
          options.modes = parseMode(argv[index + 1])
        }
        break

      case CLI_PARAMS.names.name:
      case CLI_PARAMS.names.shortName:
        if (index + 1 < argv.length) {
          options.names = parseNames(argv[index + 1])
        }
        break

      case CLI_PARAMS.sizes.name:
      case CLI_PARAMS.sizes.shortName:
        if (index + 1 < argv.length) {
          options.sizes = parseSizes(argv[index + 1])
        }
        break

      default:
        break
    }
  })

  if (!options.type || (options.type !== SOURCE_TYPES.svg && options.type !== SOURCE_TYPES.png)) {
    options.type = SOURCE_TYPES.svg
  }

  if (!options.modes) {
    options.modes = OUTPUT_MODES.all
  }

  if (!options.sizes) {
    options.sizes = {}
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
    const options = parseArgv(argv)
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
