import Path from 'path';

/**
 * Commad line options.
 *
 * @typedef {Object} CLIOptions
 * @property {Boolean} help    Mode to display the help text.
 * @property {Boolean} version Mode to display the version number.
 * @property {String}  input   Path of the SVG file or PNG file directory.
 * @property {String}  output  Path of the output directory.
 * @property {String}  type    Type of input file. 'svg' is the SVG file, 'png' is the PNG directory. Default is 'svg'.
 * @property {Boolean} report  Display the process reports. Default is disable.
 */

/**
 * Constatns of CLI process.
 * @type {Object}
 */
export const CLIConstatns = {
  /**
   * CLI options.
   * @type {Object}
   */
  options: {
    help:    [ '-h', '--help' ],
    version: [ '-v', '--version' ],
    input:   [ '-i', '--input' ],
    output:  [ '-o', '--output' ],
    type:    [ '-t', '--type' ],
    report:  [ '-r', '--report' ]
  },

  /**
   * Execution types.
   * @type {Object}
   */
  types: {
    svg: 'svg',
    png: 'png'
  }
};

/**
 * Utility for a command line process.
 */
export default class CLIUtil {
  /**
   * Show the help text.
   *
   * @param {WritableStream} stream Target stream.
   *
   * @return {Promise} Promise object.
   */
  static showHelp( stream ) {
    return new Promise( ( resolve ) => {
      stream.write( `
Usage: icon-gen [OPTIONS]

Generate an icon from the SVG or PNG file.

Options:
  -h, --help    Display this text.

  -v, --version Display the version number.

  -i, --input   Path of the SVG file or PNG file directory.

  -o, --output  Path of the output directory.

  -t, --type    Type of input file.
                'svg' is the SVG file, 'png' is the PNG directory.
                Default is 'svg'.

  -r, --report  Display the process reports.
                Default is disable.

Examples:
  $ icon-gen -i sample.svg -o ./dist
  $ icon-gen -i ./images -o ./dist -t png

See also:
  https://github.com/akabekobeko/npm-icon-gen
  ` );

      resolve();
    } );
  }

  /**
   * Show the version number.
   *
   * @param {WritableStream} stream Target stream.
   *
   * @return {Promise} Promise object.
   */
  static showVersion( stream ) {
    return new Promise( ( resolve ) => {
      const read = ( path ) => {
        try {
          return require( path ).version;
        } catch( err ) {
          return null;
        }
      };

      const version = read( '../package.json' ) || read( '../../package.json' );
      stream.write( 'v' + version + '\n' );

      resolve();
    } );
  }

  /**
   * Parse for the command line argumens.
   *
   * @param {Array.<String>} args   Arguments of the command line.
   *
   * @return {CLIOptions} Parse results.
   */
  static parse( argv ) {
    if( !( argv && 0 < argv.length ) ) {
      return { help: true };
    }

    switch( argv[ 0 ] ) {
      case CLIConstatns.options.help[ 0 ]:
      case CLIConstatns.options.help[ 1 ]:
        return { help: true };

      case CLIConstatns.options.version[ 0 ]:
      case CLIConstatns.options.version[ 1 ]:
        return { version: true };

      default:
        return CLIUtil._parse( argv );
    }
  }

  /**
   * Parse for the command line argumens.
   *
   * @param {Array.<String>} args   Arguments of the command line.
   *
   * @return {CLIOptions} Parse results.
   */
  static _parse( argv ) {
    const options = {};
    argv.forEach( ( arg, index ) => {
      switch( arg ) {
        case CLIConstatns.options.input[ 0 ]:
        case CLIConstatns.options.input[ 1 ]:
          if( index + 1 < argv.length ) {
            options.input = Path.resolve( argv[ index + 1 ] );
          }
          break;

        case CLIConstatns.options.output[ 0 ]:
        case CLIConstatns.options.output[ 1 ]:
          if( index + 1 < argv.length ) {
            options.output = Path.resolve( argv[ index + 1 ] );
          }
          break;

        case CLIConstatns.options.type[ 0 ]:
        case CLIConstatns.options.type[ 1 ]:
          if( index + 1 < argv.length ) {
            options.type = argv[ index + 1 ];
          }
          break;

        case CLIConstatns.options.report[ 0 ]:
        case CLIConstatns.options.report[ 1 ]:
          options.report = true;
          break;

        default:
          break;
      }
    } );

    if( !( options.type ) || ( options.type !== CLIConstatns.types.svg && options.type !== CLIConstatns.types.png ) ) {
      options.type = CLIConstatns.types.svg;
    }

    return options;
  }
}
