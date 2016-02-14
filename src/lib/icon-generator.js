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

/**
 * Generate an icons.
 */
export default class IconGenerator {
  /**
   * Generate an icon from the SVG file.
   *
   * @param {String} src    SVG file path.
   * @param {String} dir    Destination directory path.
   * @param {Logger} logger Logger.
   *
   * @return {Promise} Promise object.
   */
  static fromSVG( src, dir, logger ) {
    return new Promise( ( resolve, reject ) => {
      const svgFilePath = Path.resolve( src );
      const destDirPath = Path.resolve( dir );
      logger.log( 'Icon generetor from SVG:' );
      logger.log( '  src: ' + svgFilePath );
      logger.log( '  dir: ' + destDirPath );

      const workDir = PngGenerator.createWorkDir();
      if( !( workDir ) ) {
        return reject( new Error( 'Failed to create the working directory.' ) );
      }

      PngGenerator.generate( svgFilePath, workDir, ( err, images ) => {
        if( err ) {
          Del.sync( [ workDir ], { force: true } );
          return reject( err );
        }

        IconGenerator.generateAll( images, destDirPath, logger, ( err2, results ) => {
          Del.sync( [ workDir ], { force: true } );
          return ( err2 ? reject( err2 ) : resolve( results ) );
        } );
      }, logger );
    } );
  }

  /**
   * Generate an icon from the SVG file.
   *
   * @param {Array.<String>} src    PNG files path.
   * @param {String}         dir    Destination directory path.
   * @param {Logger}         logger Logger.
   *
   * @return {Promise} Promise object.
   */
  static fromPNG( src, dir, logger ) {
    return new Promise( ( resolve, reject ) => {
      const pngDirPath  = Path.resolve( src );
      const destDirPath = Path.resolve( dir );
      logger.log( 'Icon generetor from SVG:' );
      logger.log( '  src: ' + pngDirPath );
      logger.log( '  dir: ' + destDirPath );

      const images = PngGenerator.getRequiredImageSizes()
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
        return reject( new Error( '"' + notExistsFile + '" does not exist.' ) );
      }

      IconGenerator.generateAll( images, dir, logger, ( err, results ) => {
        return ( err ? reject( err ) : resolve( results ) );
      } );
    } );
  }

  /**
   * Generate an icon from the image file infromations.
   *
   * @param {Array.<ImageInfo>} images  Image file informations.
   * @param {String}            dest    Destination directory path.
   * @param {Logger}            logger  Logger.
   * @param {Function}          cb      Callback function.
   */
  static generateAll( images, dest, logger, cb ) {
    if( !( images && 0 < images.length ) ) {
      return cb( new Error( 'Targets is empty.' ) );
    }

    const dir = Path.resolve( dest );
    const tasks = [
      IconGenerator.generate( IcoGenerator, images, IcoConstants.imageSizes, Path.join( dir, 'app.ico' ), logger ),
      IconGenerator.generate( IcnsGenerator, images, IcnsConstants.imageSizes, Path.join( dir, 'app.icns' ), logger ),
      IconGenerator.generateFAVICON( images, dir, logger )
    ];

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
   * Generate the icons from iamge informations.
   *
   * @param {IcoGenerator|IcnsGenerator} editor Icon editor.
   * @param {Array.<ImageInfo>}          images Image informations.
   * @param {Array.<Number>}             sizes  The sizes of the image to be used.
   * @param {String}                     dest   The path of the output icon file.
   * @param {Logger}                     logger  Logger.
   *
   * @return {Promise} Icon generation task.
   */
  static generate( editor, images, sizes, dest, logger ) {
    return new Promise( ( resolve, reject ) => {
      editor.generate( IconGenerator.filter( images, sizes ), dest, ( err ) => {
        return ( err ? reject( err ) : resolve( dest ) );
      }, logger );
    } );
  }

  /**
   * Generate the favorite icons from iamge informations.
   *
   * @param {Array.<ImageInfo>} images Image informations.
   * @param {String}            dir    The path of the output icon file or directory.
   * @param {Logger}            logger Logger.
   *
   * @return {Promise} Icon generation task.
   */
  static generateFAVICON( images, dir, logger ) {
    return new Promise( ( resolve, reject ) => {
      const favImages = IconGenerator.filter( images, FaviconConstants.imageSizes );
      const icoImages = IconGenerator.filter( images, FaviconConstants.icoImageSizes );

      FaviconGenerator.generate( favImages, icoImages, dir, ( err, results ) => {
        return ( err ? reject( err ) : resolve( results ) );
      }, logger );
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
