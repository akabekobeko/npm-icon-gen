import Path from 'path';
import ImageFileCreator from './image-file-creator.js';
import IcoEditor from './ico-editor.js';
import { IcoConstants } from './ico-editor.js';
import IcnsEditor from './icns-editor.js';
import { IcnsConstants } from './icns-editor.js';
import FaviconEditor from './favicon-editor.js';
import { FaviconConstants } from './favicon-editor.js';

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
      IconGenerator.generate( IcoEditor, targets, IcoConstants.imageSizes, Path.join( dir, 'app.ico' ) ),
      IconGenerator.generate( IcnsEditor, targets, IcnsConstants.imageSizes, Path.join( dir, 'app.icns' ) ),
      IconGenerator.generate( FaviconEditor, targets, FaviconConstants.imageSizes, dir ),
      IconGenerator.generate( IcoEditor, targets, FaviconConstants.icoImageSizes, Path.join( dir, 'favicon.ico' ) )
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
   * Genereta the icons from iamge informations.
   *
   * @param {IcoEditor|IcnsEditor|FaviconEditor} editor  Icon editor.
   * @param {Array.<ImageInfo>}                  targets Image informations.
   * @param {Array.<Number>}                     sizes   The sizes of the image to be used.
   * @param {String}                             dest    The path of the output icon file or directory.
   *
   * @return {Promise} Icon generation task.
   */
  static generate( editor, targets, sizes, dest ) {
    return new Promise( ( resolve, reject ) => {
      editor.create( IconGenerator.filter( targets, sizes ), dest, ( err ) => {
        return ( err ? reject( err ) : resolve() );
      } );
    } );
  }

  /**
   * Filter by size to the specified image informations.
   *
   * @param {Array.<ImageInfo>} targets Image file informations.
   * @param {Array.<Number>}    sizes   Sizes.
   *
   * @return {Array.<ImageInfo>} Filtered image informations.
   */
  static filter( targets, sizes ) {
    return targets
    .filter( ( target ) => {
      return sizes.some( ( size ) => {
        return ( target.size === size );
      } );
    } )
    .sort( ( a, b ) => {
      return ( a.size - b.size );
    } );
  }
}
