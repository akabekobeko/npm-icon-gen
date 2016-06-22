import Fs from 'fs';
import Path from 'path';
import Del from 'del';
import PngGenerator from './png-generator.js';
import IcoGenerator from './ico-generator.js';
import { IcoConstants } from './ico-generator.js';
import IcnsGenerator from './icns-generator.js';
import { IcnsConstants } from './icns-generator.js';
import FaviconGenerator from './favicon-generator.js';
import { FaviconConstants } from './favicon-generator.js';
import { CLIConstatns } from '../bin/cli-util.js';

/**
 * Generate an icons.
 */
export default class IconGenerator {
  /**
   * Generate an icon from the SVG file.
   *
   * @param {String}         src    Path of the SVG file.
   * @param {String}         dir    Path of the output files directory.
   * @param {Array.<String>} modes  Modes of an output files.
   * @param {Logger}         logger Logger.
   *
   * @return {Promise} Promise object.
   */
  static fromSVG( src, dir, modes, logger ) {
    return new Promise( ( resolve, reject ) => {
      const svgFilePath = Path.resolve( src );
      const destDirPath = Path.resolve( dir );
      logger.log( 'Icon generetor from SVG:' );
      logger.log( '  src: ' + svgFilePath );
      logger.log( '  dir: ' + destDirPath );

      const workDir = PngGenerator.createWorkDir();
      if( !( workDir ) ) {
        reject( new Error( 'Failed to create the working directory.' ) );
        return;
      }

      PngGenerator.generate( svgFilePath, workDir, modes, ( err, images ) => {
        if( err ) {
          Del.sync( [ workDir ], { force: true } );
          reject( err );
          return;
        }

        IconGenerator.generate( images, destDirPath, modes, logger, ( err2, results ) => {
          Del.sync( [ workDir ], { force: true } );
          return ( err2 ? reject( err2 ) : resolve( results ) );
        } );
      }, logger );
    } );
  }

  /**
   * Generate an icon from the SVG file.
   *
   * @param {String}         src    Path of the PNG files direcgtory.
   * @param {String}         dir    Path of the output files directory.
   * @param {Array.<String>} modes  Modes of an output files.
   * @param {Logger}         logger Logger.
   *
   * @return {Promise} Promise object.
   */
  static fromPNG( src, dir, modes, logger ) {
    return new Promise( ( resolve, reject ) => {
      const pngDirPath  = Path.resolve( src );
      const destDirPath = Path.resolve( dir );
      logger.log( 'Icon generetor from PNG:' );
      logger.log( '  src: ' + pngDirPath );
      logger.log( '  dir: ' + destDirPath );

      const images = PngGenerator.getRequiredImageSizes( modes )
      .map( ( size ) => {
        return Path.join( pngDirPath, size + '.png' );
      } )
      .map( ( path ) => {
        const size = Number( Path.basename( path, '.png' ) );
        return { path, size };
      } );

      let notExistsFile = null;
      images.some( ( image ) => {
        const stat = Fs.statSync( image.path );
        if( !( stat && stat.isFile() ) ) {
          notExistsFile = Path.basename( image.path );
          return true;
        }

        return false;
      } );

      if( notExistsFile ) {
        reject( new Error( '"' + notExistsFile + '" does not exist.' ) );
        return;
      }

      IconGenerator.generate( images, dir, modes, logger, ( err, results ) => {
        return ( err ? reject( err ) : resolve( results ) );
      } );
    } );
  }

  /**
   * Generate an icon from the image file infromations.
   *
   * @param {Array.<ImageInfo>} images  Image file informations.
   * @param {String}            dest    Destination directory path.
   * @param {Array.<String>}    modes   Modes of an output files.
   * @param {Logger}            logger  Logger.
   * @param {Function}          cb      Callback function.
   */
  static generate( images, dest, modes, logger, cb ) {
    if( !( images && 0 < images.length ) ) {
      cb( new Error( 'Targets is empty.' ) );
      return;
    }

    // Select output mode
    const dir   = Path.resolve( dest );
    const tasks = [];
    modes.forEach( ( mode ) => {
      switch( mode ) {
        case CLIConstatns.modes.ico:
          tasks.push( IcoGenerator.generate( IconGenerator.filter( images, IcoConstants.imageSizes ), Path.join( dir, 'app.ico' ), logger ) );
          break;

        case CLIConstatns.modes.icns:
          tasks.push( IcnsGenerator.generate( IconGenerator.filter( images, IcnsConstants.imageSizes ), Path.join( dir, 'app.icns' ), logger ) );
          break;

        case CLIConstatns.modes.favicon:
          tasks.push( IcoGenerator.generate( IconGenerator.filter( images, FaviconConstants.icoImageSizes ), Path.join( dir, 'favicon.ico' ), logger ) );
          tasks.push( FaviconGenerator.generate( IconGenerator.filter( images, FaviconConstants.imageSizes ), dir, logger ) );
          break;

        default:
          break;
      }
    } );

    Promise
    .all( tasks )
    .then( ( results ) => {
      cb( null, IconGenerator.flattenValues( results ) );
    } )
    .catch( ( err ) => {
      cb( err );
    } );
  }

  /**
   * Filter by size to the specified image informations.
   *
   * @param {Array.<ImageInfo>} images Image file informations.
   * @param {Array.<Number>}    sizes  Required sizes.
   *
   * @return {Array.<ImageInfo>} Filtered image informations.
   */
  static filter( images, sizes ) {
    return images
    .filter( ( image ) => {
      return sizes.some( ( size ) => {
        return ( image.size === size );
      } );
    } )
    .sort( ( a, b ) => {
      return ( a.size - b.size );
    } );
  }

  /**
   * Convert a values to a flat array.
   *
   * @param  {Array.<String|Array>} values Values ( [ 'A', 'B', [ 'C', 'D' ] ] ).
   *
   * @return {Array.<String>} Flat array ( [ 'A', 'B', 'C', 'D' ] ).
   */
  static flattenValues( values ) {
    const paths = [];
    values.forEach( ( value ) => {
      if( !( value ) ) { return; }

      if( Array.isArray( value ) ) {
        value.forEach( ( path ) => {
          paths.push( path );
        } );
      } else {
        paths.push( value );
      }
    } );

    return paths;
  }
}
