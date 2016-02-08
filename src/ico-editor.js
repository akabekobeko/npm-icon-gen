import Fs from 'fs';
import { PNG } from 'pngjs';

/**
 * It defines constants for the ICO.
 * @type {Object}
 */
export const IcoConstants = {
  /**
   * Sizes required for the ICO file.
   * @type {Array}
   */
  imageSizes: [ 16, 24, 32, 48, 64, 128, 256 ],

  /**
   * Size of the file header.
   * @type {Number}
   */
  headerSize: 6,

  /**
   * Size of the icon directory.
   * @type {Number}
   */
  directorySize: 16,

  /**
   * Size of the BITMAPINFOHEADER.
   * @type {Number}
   */
  BitmapInfoHeaderSize: 40,

  /**
   * Color mode.
   * @type {Number}
   */
  BI_RGB: 0
};

/**
 * Generate a ico file from PNG images.
 */
export default class IcoEditor {
  /**
   * Create the ICO file from a PNG images.
   *
   * @param {Array.<ImageInfo>} images File informations..
   * @param {String}            dest   Output destination The path of ICO file.
   * @param {Function}          cb     Callback function.
   */
  static create( images, dest, cb ) {
    try {
      const stream = Fs.createWriteStream( dest );
      stream.write( IcoEditor.createFileHeader( images.length ), 'binary' );

      const pngs = images.map( ( image ) => {
        const data = Fs.readFileSync( image.path );
        return PNG.sync.read( data );
      } );

      let offset = IcoConstants.headerSize + ( IcoConstants.directorySize * images.length );
      pngs.forEach( ( png ) => {
        const directory = IcoEditor.createDirectory( png, offset );
        stream.write( directory, 'binary' );
        offset += png.data.length + IcoConstants.BitmapInfoHeaderSize;
      } );

      pngs.forEach( ( png ) => {
        const header = IcoEditor.createBitmapInfoHeader( png, IcoConstants.BI_RGB );
        stream.write( header, 'binary' );
        stream.write( IcoEditor.convertRGBAtoBGRA( png.data ), 'binary' );
      } );

      cb();

    } catch( err ) {
      cb( err );
    }
  }

  /**
   * Create the ICO file header.
   *
   * @param {Number} count  Specifies number of images in the file.
   *
   * @return {Buffer} Header data.
   */
  static createFileHeader( count ) {
    const b = new Buffer( IcoConstants.headerSize );
    b.writeUInt16LE( 0, 0 );     // 2 Reserved
    b.writeUInt16LE( 1,  2 );    // 2 Type
    b.writeUInt16LE( count, 4 ); // 2 Image count

    return b;
  }

  /**
   * Create the Icon entry.
   *
   * @param {Object} png    PNG image.
   * @param {Number} offset The offset of directory data from the beginning of the ICO/CUR file
   *
   * @return {Buffer} Directory data.
   */
  static createDirectory( png, offset ) {
    const b      = new Buffer( IcoConstants.directorySize );
    const size   = png.data.length + IcoConstants.BitmapInfoHeaderSize;
    const width  = ( 256 <= png.width ? 0 : png.width );
    const height = ( 256 <= png.height ? 0 : png.height );
    const bpp    = png.bpp * 8;

    b.writeUInt8( width, 0 );      // 1 Image width
    b.writeUInt8( height, 1 );     // 1 Image height
    b.writeUInt8( 0, 2 );          // 1 Colors
    b.writeUInt8( 0, 3 );          // 1 Reserved
    b.writeUInt16LE( 1, 4 );       // 2 Color planes
    b.writeUInt16LE( bpp, 6 );     // 2 Bit per pixel
    b.writeUInt32LE( size, 8 );    // 4 Bitmap ( DIB ) size
    b.writeUInt32LE( offset, 12 ); // 4 Offset

    return b;
  }

  /**
   * Create the BITMAPINFOHEADER.
   *
   * @param {Object} png         PNG image.
   * @param {Number} compression Compression mode
   *
   * @return {Buffer} BITMAPINFOHEADER data.
   */
  static createBitmapInfoHeader( png, compression ) {
    const b = new Buffer( IcoConstants.BitmapInfoHeaderSize );
    b.writeUInt32LE( IcoConstants.BitmapInfoHeaderSize, 0 ); // 4 DWORD biSize
    b.writeInt32LE( png.width, 4 );                          // 4 LONG  biWidth
    b.writeInt32LE( png.height * 2, 8 );                     // 4 LONG  biHeight
    b.writeUInt16LE( 1, 12 );                                // 2 WORD  biPlanes
    b.writeUInt16LE( png.bpp * 8, 14 );                      // 2 WORD  biBitCount
    b.writeUInt32LE( compression, 16 );                      // 4 DWORD biCompression
    b.writeUInt32LE( png.data.length, 20 );                  // 4 DWORD biSizeImage
    b.writeInt32LE( 0, 24 );                                 // 4 LONG  biXPelsPerMeter
    b.writeInt32LE( 0, 28 );                                 // 4 LONG  biYPelsPerMeter
    b.writeUInt32LE( 0, 32  );                               // 4 DWORD biClrUsed
    b.writeUInt32LE( 0, 36 );                                // 4 DWORD biClrImportant

    return b;
  }

  /**
   * To convert the image from RGBA to GBRA.
   *
   * @param {Buffer} src Target image.
   *
   * @return {Buffer} Converted image
   */
  static convertRGBAtoBGRA( src ) {
    const dest = new Buffer( src.length );
    for( let i = 0, max = src.length; i < max; ++i ) {
      let pos = i;
      const r = src.readUInt8( i );
      const g = src.readUInt8( ++i );
      const b = src.readUInt8( ++i );
      const a = src.readUInt8( ++i );

      dest.writeUInt8( g, pos );
      dest.writeUInt8( b, ++pos );
      dest.writeUInt8( r, ++pos );
      dest.writeUInt8( a, ++pos );
    }

    return dest;
  }
}
