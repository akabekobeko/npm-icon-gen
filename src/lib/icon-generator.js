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
   * @param {Function} cb  Callback function.
   */
  static fromSVG( src, dir, cb ) {
    const workDir = PngGenerator.createWorkDir();
    if( !( workDir ) ) {
      return cb( new Error( 'Failed to create the working directory.' ) );
    }

    PngGenerator.generate( src, dir, ( err, images ) => {
      if( err ) {
        console.error( err );
        Del.sync( [ workDir ], { force: true } );
        return cb( err );
      }

      IconGenerator.generateAll( images, dir, cb );
    } );
  }

  /**
   * Generate an icon from the image file infromations.
   *
   * @param {Array.<ImageInfo>} images Image file informations.
   * @param {String}            dest   Destination directory path.
   * @param {Function}          cb     Callback function.
   */
  static generateAll( images, dest, cb ) {
    if( !( images && 0 < images.length ) ) {
      return cb( new Error( 'Targets is empty.' ) );
    }

    const dir = Path.resolve( dest );
    const tasks = [
      IconGenerator.generate( IcoGenerator, images, IcoConstants.imageSizes, Path.join( dir, 'app.ico' ) ),
      IconGenerator.generate( IcnsGenerator, images, IcnsConstants.imageSizes, Path.join( dir, 'app.icns' ) ),
      IconGenerator.generateFAVICON( images, dir ),
    ];

    Promise
    .all( tasks )
    .then( () => {
      cb();
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
   *
   * @return {Promise} Icon generation task.
   */
  static generate( editor, images, sizes, dest ) {
    return new Promise( ( resolve, reject ) => {
      editor.generate( IconGenerator.filter( images, sizes ), dest, ( err ) => {
        return ( err ? reject( err ) : resolve() );
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

      FaviconGenerator.generate( favImages, icoImages, dir, ( err ) => {
        return ( err ? reject( err ) : resolve() );
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
