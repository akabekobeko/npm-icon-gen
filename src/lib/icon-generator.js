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
   * @param {String}   src SVG file path.
   * @param {String}   dir Destination directory path.
   *
   * @return {Promise} Promise object.
   */
  static fromSVG( src, dir ) {
    return new Promise( ( resolve, reject ) => {
      const workDir = PngGenerator.createWorkDir();
      if( !( workDir ) ) {
        return reject( new Error( 'Failed to create the working directory.' ) );
      }

      PngGenerator.generate( Path.resolve( src ), workDir, ( err, images ) => {
        if( err ) {
          Del.sync( [ workDir ], { force: true } );
          return reject( err );
        }

        IconGenerator.generateAll( images, Path.resolve( dir ), resolve, reject, workDir );
      } );
    } );
  }

  /**
   * Generate an icon from the SVG file.
   *
   * @param {Array.<String>} src PNG files path.
   * @param {String}         dir Destination directory path.
   *
   * @return {Promise} Promise object.
   */
  static fromPNG( src, dir ) {
    const dataDir = Path.resolve( src );
    const paths = PngGenerator.getRequiredImageSizes().map( ( size ) => {
      return Path.join( dataDir, size + '.png' );
    } );

    return new Promise( ( resolve, reject ) => {
      const images = paths.map( ( path ) => {
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

      IconGenerator.generateAll( images, dir, resolve, reject );
    } );
  }

  /**
   * Generate an icon from the image file infromations.
   *
   * @param {Array.<ImageInfo>} images  Image file informations.
   * @param {String}            dest    Destination directory path.
   * @param {Function}          resolve Callback function.
   * @param {Function}          reject  Callback function fro error.
   * @param {String}            workDir Work directory path. Defalt is undefined.
   */
  static generateAll( images, dest, resolve, reject, workDir ) {
    if( !( images && 0 < images.length ) ) {
      return reject( new Error( 'Targets is empty.' ) );
    }

    const dir = Path.resolve( dest );
    const tasks = [
      IconGenerator.generate( IcoGenerator, images, IcoConstants.imageSizes, Path.join( dir, 'app.ico' ) ),
      IconGenerator.generate( IcnsGenerator, images, IcnsConstants.imageSizes, Path.join( dir, 'app.icns' ) ),
      IconGenerator.generateFAVICON( images, dir ),
    ];

    Promise
    .all( tasks )
    .then( ( results ) => {
      if( workDir ) {
        Del.sync( [ workDir ], { force: true } );
      }

      resolve( IconGenerator.flattenValues( results ) );
    } )
    .catch( ( err ) => {
      if( workDir ) {
        Del.sync( [ workDir ], { force: true } );
      }

      reject( err );
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

  /**
   * Generate the icons from iamge informations.
   *
   * @param {IcoGenerator|IcnsGenerator} editor Icon editor.
   * @param {Array.<ImageInfo>}          images Image informations.
   * @param {Array.<Number>}             sizes  The sizes of the image to be used.
   * @param {String}                     dest   The path of the output icon file.
   *
   * @return {Promise} Icon generation task.
   */
  static generate( editor, images, sizes, dest ) {
    return new Promise( ( resolve, reject ) => {
      editor.generate( IconGenerator.filter( images, sizes ), dest, ( err ) => {
        return ( err ? reject( err ) : resolve( dest ) );
      } );
    } );
  }

  /**
   * Generate the favorite icons from iamge informations.
   *
   * @param {Array.<ImageInfo>} images Image informations.
   * @param {String}            dir    The path of the output icon file or directory.
   *
   * @return {Promise} Icon generation task.
   */
  static generateFAVICON( images, dir ) {
    return new Promise( ( resolve, reject ) => {
      const favImages = IconGenerator.filter( images, FaviconConstants.imageSizes );
      const icoImages = IconGenerator.filter( images, FaviconConstants.icoImageSizes );

      FaviconGenerator.generate( favImages, icoImages, dir, ( err, results ) => {
        return ( err ? reject( err ) : resolve( results ) );
      } );
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
}
