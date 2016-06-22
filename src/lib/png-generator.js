import OS from 'os';
import Fs from 'fs';
import Path from 'path';
import UUID from 'node-uuid';
import SVG2PNG from 'svg2png';
import { FaviconConstants } from './favicon-generator.js';
import { IcoConstants } from './ico-generator.js';
import { IcnsConstants } from './icns-generator.js';
import { CLIConstatns } from '../bin/cli-util.js';

/**
 * Generate the PNG files from SVG file.
 */
export default class PngGenerator {
  /**
   * Generate the PNG files from the SVG file.
   *
   * @param {String}         src    SVG file path.
   * @param {String}         dir    Output destination The path of directory.
   * @param {Array.<String>} modes  Modes of an output files.
   * @param {Function}       cb     Callback function.
   * @param {Logger}         logger Logger.
   */
  static generate( src, dir, modes, cb, logger ) {
    Fs.readFile( src, ( err, svg ) => {
      if( err ) {
        cb( err );
        return;
      }

      logger.log( 'SVG to PNG:' );

      const sizes = PngGenerator.getRequiredImageSizes( modes );
      Promise
      .all( sizes.map( ( size ) => {
        return PngGenerator.generetePNG( svg, size, dir, logger );
      } ) )
      .then( ( results ) => {
        cb( null, results );
      } )
      .catch( ( err2 ) => {
        cb( err2 );
      } );
    } );
  }

  /**
   * Generate the PNG file from the SVG data.
   *
   * @param {Buffer} svg    SVG data that has been parse by svg2png.
   * @param {Number} size   The size ( width/height ) of the image.
   * @param {String} dir    Path of the file output directory.
   * @param {Logger} logger Logger.
   *
   * @return {Promise} Image generation task.
   */
  static generetePNG( svg, size, dir, logger ) {
    return new Promise( ( resolve, reject ) => {
      if( !( svg && 0 < size && dir ) ) {
        reject( new Error( 'Invalid parameters.' ) );
        return;
      }

      const dest = Path.join( dir, size + '.png' );
      logger.log( '  Create: ' + dest );

      const buffer = SVG2PNG.sync( svg, { width: size, height: size } );
      if( !( buffer ) ) {
        reject( new Error( 'Faild to write the image, ' + size + 'x' + size ) );
        return;
      }

      Fs.writeFile( dest, buffer, ( err ) => {
        if( err ) {
          reject( err );
          return;
        }

        resolve( { size: size, path: dest } );
      } );
    } );
  }

  /**
   * Create the work directory.
   *
   * @return {String} The path of the created directory, failure is null.
   */
  static createWorkDir() {
    const dir = Path.join( OS.tmpdir(), UUID.v4() );
    Fs.mkdirSync( dir );

    const stat = Fs.statSync( dir );
    return ( stat && stat.isDirectory() ? dir : null );
  }

  /**
   * Gets the size of the images needed to create an icon.
   *
   * @param {Array.<String>} modes Modes of an output files.
   *
   * @return {Array.<Number>} The sizes of the image.
   */
  static getRequiredImageSizes( modes ) {
    let sizes = [];
    if( modes && 0 < modes.length ) {
      modes.forEach( ( mode ) => {
        switch( mode ) {
          case CLIConstatns.modes.ico:
            sizes = sizes.concat( IcoConstants.imageSizes );
            break;

          case CLIConstatns.modes.icns:
            sizes = sizes.concat( IcnsConstants.imageSizes );
            break;

          case CLIConstatns.modes.favicon:
            sizes = sizes.concat( FaviconConstants.imageSizes );
            break;

          default:
            break;
        }
      } );
    }

    // 'all' mode
    if( sizes.length === 0 ) {
      sizes = FaviconConstants.imageSizes.concat( IcoConstants.imageSizes ).concat( IcnsConstants.imageSizes );
    }

    return sizes
    .filter( ( value, index, array ) => {
      return ( array.indexOf( value ) === index );
    } )
    .sort( ( a, b ) => {
      // Always ensure the ascending order
      return ( a - b );
    } );
  }
}
