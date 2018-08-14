import Path from 'path'

/**
 * CLI parameters [Short, Full].
 * @type {Object}
 */
const CLI_PARAMS = {
  help: ['-h', '--help'],
  version: ['-v', '--version'],
  input: ['-i', '--input'],
  output: ['-o', '--output'],
  type: ['-t', '--type'],
  modes: ['-m', '--modes'],
  sizes: ['-s', '--sizes'],
  names: ['-n', '--names'],
  report: ['-r', '--report']
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
 * Utility of the commad line interface.
 */
export default class CLI {
  /**
   * Show the help text.
   *
   * @param {WritableStream} stream Target stream.
   *
   * @return {Promise} Promise object.
   */
  static showHelp (stream) {
    return new Promise((resolve) => {
      stream.write(HELP_TEXT)
      resolve()
    })
  }

  /**
   * Show the version number.
   *
   * @param {WritableStream} stream Target stream.
   *
   * @return {Promise} Promise object.
   */
  static showVersion (stream) {
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
   * Parse for the command line argumens.
   *
   * @param {Array.<String>} argv Arguments of the command line.
   *
   * @return {CLIOptions} Parse results.
   */
  static parse (argv) {
    if (!(argv && 0 < argv.length)) {
      return {help: true}
    }

    switch (argv[0]) {
      case CLI_PARAMS.help[0]:
      case CLI_PARAMS.help[1]:
        return {help: true}

      case CLI_PARAMS.version[0]:
      case CLI_PARAMS.version[1]:
        return {version: true}

      default:
        return CLI._parse(argv)
    }
  }

  /**
   * Parse for the command line argumens.
   *
   * @param {Array.<String>} argv Arguments of the command line.
   *
   * @return {CLIOptions} Parse results.
   */
  static _parse (argv) {
    const options = {}
    argv.forEach((arg, index) => {
      switch (arg) {
        case CLI_PARAMS.input[0]:
        case CLI_PARAMS.input[1]:
          if (index + 1 < argv.length) {
            options.input = Path.resolve(argv[index + 1])
          }
          break

        case CLI_PARAMS.output[0]:
        case CLI_PARAMS.output[1]:
          if (index + 1 < argv.length) {
            options.output = Path.resolve(argv[index + 1])
          }
          break

        case CLI_PARAMS.type[0]:
        case CLI_PARAMS.type[1]:
          if (index + 1 < argv.length) {
            options.type = argv[index + 1]
          }
          break

        case CLI_PARAMS.report[0]:
        case CLI_PARAMS.report[1]:
          options.report = true
          break

        case CLI_PARAMS.modes[0]:
        case CLI_PARAMS.modes[1]:
          if (index + 1 < argv.length) {
            options.modes = CLI._parseMode(argv[index + 1])
          }
          break

        case CLI_PARAMS.names[0]:
        case CLI_PARAMS.names[1]:
          if (index + 1 < argv.length) {
            options.names = CLI._parseNames(argv[index + 1])
          }
          break

        case CLI_PARAMS.sizes[0]:
        case CLI_PARAMS.sizes[1]:
          if (index + 1 < argv.length) {
            options.sizes = CLI._parseSizes(argv[index + 1])
          }
          break

        default:
          break
      }
    })

    if (!(options.type) || (options.type !== SOURCE_TYPES.svg && options.type !== SOURCE_TYPES.png)) {
      options.type = SOURCE_TYPES.svg
    }

    if (!(options.modes)) {
      options.modes = OUTPUT_MODES.all
    }

    if (!(options.sizes)) {
      options.sizes = {}
    }

    return options
  }

  /**
   * Parse for the mode option.
   *
   * @param {String} arg Option. Format is a 'all' or 'ico,icns,favicon'.
   *
   * @return {Array.<String>} Parse results.
   */
  static _parseMode (arg) {
    if (!(arg)) {
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

    return (0 < values.length ? values : OUTPUT_MODES.all)
  }

  /**
   * Parse the output file names.
   *
   * @param {String} arg Option. Format is a 'ico=foo,icns=bar'.
   *
   * @return {Object} File names.
   */
  static _parseNames (arg) {
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

      const key   = units[0]
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
   * Parse the input file sizes.
   *
   * @param {String} arg Option. Format is a 'ico=[16,24,32],icns=[16,24,32]'.
   *
   * @return {Object} File sizes.
   */
  static _parseSizes (arg) {
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

      const key    = units[0]
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
}
