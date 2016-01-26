import ImageFileCreator from './image-file-creator.js';
import ICOEditor from './ico-editor.js';
import Path from 'path';

/**
 * Generate an icons.
 */
export default class IconGenerator {
  /**
   * Generate an icon from the SVG file.
   *
   * @param {String}   src  SVG file path.
   * @param {String}   dest Destination directory path.
   * @param {Function} cb   Callback function.
   */
  static fromSVG( src, dest, cb ) {
    const imageFileCreator = new ImageFileCreator();
    imageFileCreator.createImages( src, ( err, targets ) => {
      if( err ) {
        console.error( err );
        imageFileCreator.deleteWorkDir();
        return cb( err );
      }

      IconGenerator.generateAll( targets, dest, cb );
    } );
  }

  /**
   * Generate an icon from the image file infromations.
   *
   * @param {Array.<ImageInfo>} targets Image file informations.
   * @param {String}            dest    Destination directory path.
   * @param {Function}          cb      Callback function.
   */
  static generateAll( targets, dest, cb ) {
    if( !( targets && 0 < targets.length ) ) {
      return cb( new Error( 'Targets is empty.' ) );
    }

    const dir = Path.resolve( dest );
    const tasks = [
      IconGenerator._generateICO( ICOEditor.filter( targets ), Path.join( dir, 'app.ico' ) )
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
   * Generate the ico file from the image file infromations.
   *
   * @param {Array.<ImageInfo>} targets Image file informations.
   * @param {String}            dest    Destination ico file path.
   * @param {Function}          cb      Callback function.
   */
  static generateICO( targets, dest, cb ) {
    IconGenerator._generateICO()
    .then( () => {
      cb();
    } )
    .catch( ( err ) => {
      cb( err );
    } );
  }

  /**
   * Generate an ico file from an image file infromations.
   *
   * @param {Array.<ImageInfo>} targets Image file informations.
   * @param {String}            dest    Destination ico file path.
   */
  static _generateICO( targets, dest ) {
    return new Promise( ( resolve, reject ) => {
      ICOEditor.write( targets, dest, ( err ) => {
        if( err ) {
          reject( err );
          return;
        }

        console.log( 'Output: ' + dest );
        resolve();
      } );
    } );
  }
}
