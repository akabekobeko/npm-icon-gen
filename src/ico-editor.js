import { ImageSizes, ICOSpec } from './constants.js';
import Fs from 'fs';
import Path from 'path';

/**
 * Generate a ico file from PNG images.
 */
export default class ICOEditor {
  /**
   * Write a ico file from PNG images.
   *
   * @param {Array.<ImageInfo>} images File informations.
   * @param {String}            dest   Destination ico file path.
   * @param {Function} cb Callback function.
   */
  static write( targets, dest, cb = () => {} ) {
    if( !( targets.length ) ) {
      cb( new Error( 'Invalid arguments: It does not contain the information necessary for the "images".' ) );
      return;
    }

    {
      const dirname = Path.dirname( dest );
      const stat    = Fs.statSync( dirname );
      if( !( stat && stat.isDirectory ) ) {
        cb( new Error( 'Invalid arguments: "dest" of the parent directory does not exist.' ) );
        return;
      }
    }

    const buffer = new Buffer( ICOSpec.headerSize + ( ICOSpec.directorySize * targets.length ) );
    ICOEditor.writeHeader( buffer, 1, targets.length );
    ICOEditor.writeDirectories( buffer, targets );

    const stream = Fs.createWriteStream( dest );
    stream.write( buffer, 'binary' );

    ICOEditor.writeImages( stream, targets, cb );
  }

  /**
   * Write a directories.
   *
   * @param {Buffer}            buffer  File buffer.
   * @param {Array.<ImageInfo>} targets Image file infromations.
   */
  static writeDirectories( buffer, targets ) {
    let dirOffset = ICOSpec.headerSize;
    let imgOffset = ICOSpec.headerSize + ( ICOSpec.directorySize * targets.length );
    targets.forEach( ( target ) => {
      ICOEditor.writeDirectory( buffer, dirOffset, {
        width: target.size,
        height: target.size,
        colors: 0,
        reserved: 0,
        planes: 1,
        bpp: 32,
        size: target.stat.size,
        offset: imgOffset
      } );

      dirOffset += ICOSpec.directorySize;
      imgOffset += target.stat.size;
    } );
  }

  /**
   * Write a images.
   *
   * @param {WritableStream}    stream  File stream.
   * @param {Array.<ImageInfo>} targets Image file infromations.
   * @param {Function}          cb Callback function.
   */
  static writeImages( stream, targets, cb ) {
    const writeImage = ( target ) => {
      return new Promise( ( resolve, reject ) => {
        Fs.readFile( target.path, ( err, data ) => {
          if( err ) {
            reject( err );
            return;
          }

          stream.write( data, 'binary' );
          resolve();
        } );
      } );
    };

    const tasks = targets.map( ( target ) => {
      return writeImage( target );
    } );

    tasks
    .reduce( ( prev, current ) => {
      return prev.then( current );
    }, Promise.resolve() )
    .then( () => {
      cb();
    } )
    .catch( ( err ) => {
      cb( err );
    } );
  }

  /**
   * Read a header.
   *
   * @param {Buffer} buffer File buffer.
   *
   * @return {ICOHeader} Header data.
   */
  static readHeader( buffer ) {
    return {
      reserved: buffer.readInt16LE( 0 ),
      type:     buffer.readInt16LE( 2 ),
      count:    buffer.readInt16LE( 4 )
    };
  }

  /**
   * Read a directory.
   *
   * @param {Buffer} buffer File buffer.
   * @param {Number} offset The offset of directory data from the beginning of the ICO/CUR file
   *
   * @return {ICODirectory} Directory data.
   */
  static readDirectory( buffer, offset ) {
    return {
      width:    buffer.readInt8( 0 ),
      height:   buffer.readInt8(    offset +  1 ),
      colors:   buffer.readInt8(    offset +  2 ),
      reserved: buffer.readInt8(    offset +  3 ),
      planes:   buffer.readInt16LE( offset +  4 ),
      bpp:      buffer.readInt16LE( offset +  6 ),
      size:     buffer.readInt32LE( offset +  8 ),
      offset:   buffer.readInt32LE( offset + 12 )
    };
  }

  /**
   * Write a header.
   *
   * @param {Buffer} buffer File buffer.
   * @param {Number} type   Specifies image type: 1 for icon (.ICO) image, 2 for cursor (.CUR) image. Other values are invalid.
   * @param {Number} count  Specifies number of images in the file.
   */
  static writeHeader( buffer, type, count ) {
    buffer.writeInt16LE( 0,     0 );
    buffer.writeInt16LE( type,  2 );
    buffer.writeInt16LE( count, 4 );
  }

  /**
   * Write a directory.
   *
   * @param {Buffer}       buffer    File buffer.
   * @param {Number}       offset    The offset of directory data from the beginning of the ICO/CUR file
   * @param {ICODirectory} directory Directory data.
   */
  static writeDirectory( buffer, offset, directory ) {
    buffer.writeInt8(   directory.width,   offset );
    buffer.writeInt8(   directory.height,  offset +  1 );
    buffer.writeInt8(   directory.colors,  offset +  2 );
    buffer.writeInt8(   0,                 offset +  3 ); // reserved, should be 0
    buffer.writeInt16LE( directory.planes, offset +  4 );
    buffer.writeInt16LE( directory.bpp,    offset +  6 );
    buffer.writeInt32LE( directory.size,   offset +  8 );
    buffer.writeInt32LE( directory.offset, offset + 12 );
  }

  /**
   * Select the data necessary for the ICO file from the image informations.
   *
   * @param {Array.<ImageInfo>} images Image file infromations.
   *
   * @return {Array.<ImageInfo>} filtered array
   */
  static filter( images ) {
    if( !( images && 0 < images.length ) ) { return []; }

    return images.filter( ( image ) => {
      let exists = false;
      ImageSizes.windows.some( ( size ) => {
        if( image.size === size ) {
          exists = true;
          return true;
        }

        return false;
      } );

      return exists;
    } );
  }
}
