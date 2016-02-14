import Fs from 'fs';
import Path from 'path';
import Logger from './logger.js';
import IcoGenerator from './ico-generator.js';

/**
 * size required for the FAVICON.
 * @type {Object}
 */
export const FaviconConstants = {
  /**
   * Sizes required for the FAVICON PNG files.
   * @type {Array.<Number>}
   */
  imageSizes:  [ 32, 57, 72, 96, 120, 128, 144, 152, 195, 228 ],

  /**
   * Sizes required for the FAVICON ICO file.
   * @type {Array.<Number>}
   */
  icoImageSizes: [ 16, 24, 32, 48, 64 ],

  /**
   * File name of the FAVICON file.
   * @type {String}
   */
  icoFileName: 'favicon.ico',

  /**
   * Collection of the file name and size of the icon.
   * @type {Array.<Object>}
   * @see https://github.com/audreyr/favicon-cheat-sheet
   */
  pngFiles: [
    { name: 'favicon-32.png',  size:  32 }, // Certain old but not too old Chrome versions mishandle ico
    { name: 'favicon-57.png',  size:  57 }, // Standard iOS home screen ( iPod Touch, iPhone first generation to 3G )
    { name: 'favicon-72.png',  size:  72 }, // iPad home screen icon
    { name: 'favicon-96.png',  size:  96 }, // GoogleTV icon
    { name: 'favicon-120.png', size: 120 }, // iPhone retina touch icon ( Change for iOS 7: up from 114x114 )
    { name: 'favicon-128.png', size: 128 }, // Chrome Web Store icon
    { name: 'favicon-144.png', size: 144 }, // IE10 Metro tile for pinned site
    { name: 'favicon-152.png', size: 152 }, // iPad retina touch icon ( Change for iOS 7: up from 144x144 )
    { name: 'favicon-195.png', size: 195 }, // Opera Speed Dial icon
    { name: 'favicon-228.png', size: 228 }  // Opera Coast icon
  ]
};

/**
 * Generate a FAVICON files from a PNG images.
 */
export default class FaviconGenerator {
  /**
   * Create a FAVICON image files from a PNG images.
   *
   * @param {Array.<ImageInfo>} images    File information for the PNG files generation.
   * @param {Array.<ImageInfo>} icoImages File information for ICO file generation.
   * @param {String}            dir       Output destination The path of directory.
   * @param {Function}          cb        Callback function.
   * @param {Logger}            logger    Logger.
   */
  static generate( images, icoImages, dir, cb, logger ) {
    // PNG
    const tasks = images.map( ( image ) => {
      return FaviconGenerator.copyImage( image, dir, logger );
    } );

    // favicon.ico
    tasks.push( FaviconGenerator.generateICO( icoImages, dir, logger ) );

    logger.log( 'Favicon:' );

    Promise
    .all( tasks )
    .then( ( results ) => {
      cb( null, results );
    } )
    .catch( ( err ) => {
      cb( err );
    } );
  }

  /**
   * Copy to image.
   *
   * @param {ImageInfo} image  Image information.
   * @param {String}    dir    Output destination The path of directory.
   * @param {Logger}    logger Logger.
   *
   * @return {Promise} Task to copy an image.
   */
  static copyImage( image, dir, logger ) {
    return new Promise( ( resolve, reject ) => {
      const fileName = FaviconGenerator.fileNameFromSize( image.size );
      if( !( fileName ) ) {
        // Unknown target is ignored
        return resolve( '' );
      }

      const reader = Fs.createReadStream( image.path )
      .on( 'error', ( err ) => {
        reject( err ); }
      );

      const dest   = Path.join( dir, fileName );
      const writer = Fs.createWriteStream( dest )
      .on( 'error', ( err ) => {
        reject( err );
      } )
      .on( 'close', () => {
        logger.log( '  Create: ' + dest );
        resolve( dest );
      } );

      reader.pipe( writer );
    } );
  }

  /**
   * Generete the ICO file.
   *
   * @param {Array.<ImageInfo>} images File information for ICO file generation.
   * @param {String}            dir    Output destination The path of directory.
   * @param {Logger}            logger Logger.
   *
   * @return {Promise} Task to genereta the ICO file.
   */
  static generateICO( images, dir, logger ) {
    return new Promise( ( resolve, reject ) => {
      const dest = Path.join( dir, FaviconConstants.icoFileName );
      IcoGenerator.generate( images, dest, ( err ) => {
        if( err ) {
          return reject( err );
        }

        logger.log( '  Create: ' + dest );
        return resolve( dest );
      }, new Logger() );
    } );
  }

  /**
   * Get the file names corresponding to image size.
   *
   * @param {Number} size Size of an image.
   *
   * @return {String} If successful name, otherwise null.
   */
  static fileNameFromSize( size ) {
    let name = null;
    FaviconConstants.pngFiles.some( ( pngFile ) => {
      if( pngFile.size === size ) {
        name = pngFile.name;
        return true;
      }

      return false;
    } );

    return name;
  }
}
