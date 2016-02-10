import Fs from 'fs';
import Path from 'path';

/**
 * size required for the FAVICON.
 * @type {Array.<Number>}
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
 * Create a FAVICON files from a PNG images.
 */
export default class FaviconEditor {
  /**
   * Create a FAVICON image files from a PNG images.
   *
   * @param {Array.<ImageInfo>} images File informations..
   * @param {String}            dest   Output destination The path of directory.
   * @param {Function}          cb     Callback function.
   */
  static create( images, dest, cb ) {
    const tasks = images.map( ( image ) => {
      return FaviconEditor.copyImage( image, dest );
    } );

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
   * @param {ImageInfo} image Image information.
   * @param {String}    dir   The path of the copied image file.
   *
   * @return {Promise} Task to copy an image.
   */
  static copyImage( image, dir ) {
    return new Promise( ( resolve, reject ) => {
      const fileName = FaviconEditor.fileNameFromSize( image.size );
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
        resolve( dest );
      } );

      reader.pipe( writer );
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
