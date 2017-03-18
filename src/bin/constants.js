/**
 * Constatns of CLI process.
 * @type {Object}
 */
const CLI = {
  /**
   * CLI options.
   * @type {Object}
   */
  options: {
    help: ['-h', '--help'],
    version: ['-v', '--version'],
    input: ['-i', '--input'],
    output: ['-o', '--output'],
    type: ['-t', '--type'],
    modes: ['-m', '--modes'],
    names: ['-n', '--names'],
    report: ['-r', '--report']
  },

  /**
   * Execution types.
   * @type {Object}
   */
  types: {
    svg: 'svg',
    png: 'png'
  },

  /**
   * Output modes.
   * @type {Object}
   */
  modes: {
    ico: 'ico',
    icns: 'icns',
    favicon: 'favicon'
  },

  /**
   * Output mode for an all files.
   * @type {Array}
   */
  modeAll: ['ico', 'icns', 'favicon'],

  /**
   * File names.
   * @type {Object}
   */
  names: {
    ico: 'ico',
    icns: 'icns'
  }
}

/**
 * String of help.
 * @type {String}
 */
const Help = `
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

Examples:
$ icon-gen -i sample.svg -o ./dist -r
$ icon-gen -i ./images -o ./dist -t png -r
$ icon-gen -i sample.svg -o ./dist -m ico,favicon -r
$ icon-gen -i sample.svg -o ./dist -n ico=foo,icns=bar

See also:
https://github.com/akabekobeko/npm-icon-gen`

module.exports = {
  CLI: CLI,
  Help: Help
}
