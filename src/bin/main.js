#!/usr/bin/env node

import Path from 'path';
import Logger from '../lib/logger.js';
import IconGenerator from '../lib/icon-generator.js';

/**
 * Show the help text.
 *
 * @param {WritableStream} stream Target stream.
 *
 * @return {Promise} Promise object.
 */
function showHelp( stream ) {
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
function showVersion( stream ) {
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
 * @return {Object} Parse results.
 */
function parseArgs( args ) {
  const options = {};

  args.forEach( ( arg, index ) => {
    switch( arg ) {
      case '-i':
      case '--input':
        if( index + 1 < args.length ) {
          options.input = Path.resolve( args[ index + 1 ] );
        }
        break;

      case '-o':
      case '--output':
        if( index + 1 < args.length ) {
          options.output = Path.resolve( args[ index + 1 ] );
        }
        break;

      case '-t':
      case '--type':
        if( index + 1 < args.length ) {
          options.type = args[ index + 1 ];
        }
        break;

      case '-r':
      case '--report':
        options.report = true;
        break;

      default:
        break;
    }
  } );

  if( !( options.type ) || ( options.type !== 'svg' && options.type !== 'png' ) ) {
    options.type = 'svg';
  }

  return options;
}

/**
 * Main process.
 *
 * @param {Array.<String>} args   Arguments of the command line.
 *
 * @return {Promise} Promise object.
 */
function execute( args ) {
  return new Promise( ( resolve, reject ) => {
    const options = parseArgs( args );
    if( !( options.input ) ) {
      return reject( new Error( '"-i" or "--input" has not been specified. This parameter is required.' ) );
    }

    if( !( options.output ) ) {
      return reject( new Error( '"-o" or "--output" has not been specified. This parameter is required.' ) );
    }

    switch( options.type ) {
      case 'png':
        return IconGenerator.fromPNG( options.input, options.output, new Logger( options.report ) );

      default:
        return IconGenerator.fromSVG( options.input, options.output, new Logger( options.report ) );
    }
  } );
}

/**
 * Main process of command line.
 *
 * @param {Array.<String>} args   Arguments of the command line.
 * @param {WritableStream} stdout Standard output.
 *
 * @return {Promise} Promise object.
 */
function main( args, stdout ) {
  switch( args[ 0 ] ) {
    case undefined:
    case '-h':
    case '--help':
      return showHelp( stdout );

    case '-v':
    case '--version':
      return showVersion( stdout );

    default:
      return execute( args );
  }
}

main( process.argv.slice( 2 ), process.stdout )
.then()
.catch( ( err ) => {
  console.error( err );
} );
