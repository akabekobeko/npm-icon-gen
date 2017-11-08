import Fs from 'fs'
import Path from 'path'
import Util from './util.js'
import {PNG} from 'pngjs'

/**
 * Sizes required for the ICO file.
 * @type {Array}
 */
const REQUIRED_IMAGE_SIZES =  [16, 24, 32, 48, 64, 128, 256]

/**
 * ICNO file extension.
 * @type {String}
 */
const FILE_EXTENSION = '.ico'

/**
 * Size of the file header.
 * @type {Number}
 */
const HEADER_SIZE = 6

/**
 * Size of the icon directory.
 * @type {Number}
 */
const DIRECTORY_SIZE = 16

/**
 * Size of the BITMAPINFOHEADER.
 * @type {Number}
 */
const BITMAPINFOHEADER_SIZE = 40

/**
 * Color mode.
 * @type {Number}
 */
const BI_RGB =  0

/**
 * Generate the ICO file from PNG images.
 */
export default class ICOGenerator {
  /**
   * Generate the ICO file from a PNG images.
   *
   * @param {Array.<ImageInfo>} images  File informations..
   * @param {String}            dir     Output destination the path of directory.
   * @param {Object}            options Options.
   * @param {Logger}            logger  Logger.
   *
   * @return {Promise} Promise object.
   */
  static generate (images, dir, options, logger) {
    return new Promise((resolve) => {
      logger.log('ICO:')

      const dest    = Path.join(dir, options.names.ico + FILE_EXTENSION)
      const targets = Util.filterImagesBySizes(images, Util.checkImageSizes(REQUIRED_IMAGE_SIZES, options, 'ico'))
      const stream  = Fs.createWriteStream(dest)
      stream.write(ICOGenerator._createFileHeader(targets.length), 'binary')

      const pngs = targets.map((image) => {
        const data = Fs.readFileSync(image.path)
        return PNG.sync.read(data)
      })

      let offset = HEADER_SIZE + (DIRECTORY_SIZE * targets.length)
      pngs.forEach((png) => {
        const directory = ICOGenerator._createDirectory(png, offset)
        stream.write(directory, 'binary')
        offset += png.data.length + BITMAPINFOHEADER_SIZE
      })

      pngs.forEach((png) => {
        const header = ICOGenerator._createBitmapInfoHeader(png, BI_RGB)
        stream.write(header, 'binary')

        const dib = ICOGenerator._convertPNGtoDIB(png.data, png.width, png.height, png.bpp)
        stream.write(dib, 'binary')
      })

      stream.end()

      logger.log('  Create: ' + dest)
      resolve(dest)
    })
  }

  /**
   * Get the size of the required PNG.
   *
   * @return {Array.<Number>} Sizes.
   */
  static getRequiredImageSizes () {
    return REQUIRED_IMAGE_SIZES
  }

  /**
   * Create the ICO file header.
   *
   * @param {Number} count  Specifies number of images in the file.
   *
   * @return {Buffer} Header data.
   *
   * @see https://msdn.microsoft.com/en-us/library/ms997538.aspx
   */
  static _createFileHeader (count) {
    const b = Buffer.alloc(HEADER_SIZE)
    b.writeUInt16LE(0, 0)     // 2 WORD Reserved
    b.writeUInt16LE(1,  2)    // 2 WORD Type
    b.writeUInt16LE(count, 4) // 2 WORD Image count

    return b
  }

  /**
   * Create the Icon entry.
   *
   * @param {Object} png    PNG image.
   * @param {Number} offset The offset of directory data from the beginning of the ICO/CUR file
   *
   * @return {Buffer} Directory data.
   *
   * @see https://msdn.microsoft.com/en-us/library/ms997538.aspx
   */
  static _createDirectory (png, offset) {
    const b      = Buffer.alloc(DIRECTORY_SIZE)
    const size   = png.data.length + BITMAPINFOHEADER_SIZE
    const width  = (256 <= png.width ? 0 : png.width)
    const height = (256 <= png.height ? 0 : png.height)
    const bpp    = png.bpp * 8

    b.writeUInt8(width, 0)      // 1 BYTE  Image width
    b.writeUInt8(height, 1)     // 1 BYTE  Image height
    b.writeUInt8(0, 2)          // 1 BYTE  Colors
    b.writeUInt8(0, 3)          // 1 BYTE  Reserved
    b.writeUInt16LE(1, 4)       // 2 WORD  Color planes
    b.writeUInt16LE(bpp, 6)     // 2 WORD  Bit per pixel
    b.writeUInt32LE(size, 8)    // 4 DWORD Bitmap (DIB) size
    b.writeUInt32LE(offset, 12) // 4 DWORD Offset

    return b
  }

  /**
   * Create the BITMAPINFOHEADER.
   *
   * @param {Object} png         PNG image.
   * @param {Number} compression Compression mode
   *
   * @return {Buffer} BITMAPINFOHEADER data.
   *
   * @see https://msdn.microsoft.com/ja-jp/library/windows/desktop/dd183376%28v=vs.85%29.aspx
   */
  static _createBitmapInfoHeader (png, compression) {
    const b = Buffer.alloc(BITMAPINFOHEADER_SIZE)
    b.writeUInt32LE(BITMAPINFOHEADER_SIZE, 0) // 4 DWORD biSize
    b.writeInt32LE(png.width, 4)              // 4 LONG  biWidth
    b.writeInt32LE(png.height * 2, 8)         // 4 LONG  biHeight
    b.writeUInt16LE(1, 12)                    // 2 WORD  biPlanes
    b.writeUInt16LE(png.bpp * 8, 14)          // 2 WORD  biBitCount
    b.writeUInt32LE(compression, 16)          // 4 DWORD biCompression
    b.writeUInt32LE(png.data.length, 20)      // 4 DWORD biSizeImage
    b.writeInt32LE(0, 24)                     // 4 LONG  biXPelsPerMeter
    b.writeInt32LE(0, 28)                     // 4 LONG  biYPelsPerMeter
    b.writeUInt32LE(0, 32)                    // 4 DWORD biClrUsed
    b.writeUInt32LE(0, 36)                    // 4 DWORD biClrImportant

    return b
  }

  /**
   * Convert a PNG of the byte array to the DIB (Device Independent Bitmap) format.
   *
   * PNG in color RGBA (and more), the coordinate structure is the Top/Left to Bottom/Right.
   * DIB in color BGRA, the coordinate structure is the Bottom/Left to Top/Right.
   *
   * @param {Buffer} src    Target image.
   * @param {Number} width  The width of the image.
   * @param {Number} height The height of the image.
   * @param {Number} bpp    The bit per pixel of the image.
   *
   * @return {Buffer} Converted image
   *
   * @see https://en.wikipedia.org/wiki/BMP_file_format
   */
  static _convertPNGtoDIB (src, width, height, bpp) {
    const cols   = (width * bpp)
    const rows   = (height * cols)
    const rowEnd = (rows - cols)
    const dest   = Buffer.alloc(src.length)

    for (let row = 0; row < rows; row += cols) {
      for (let col = 0; col < cols; col += bpp) {
        // RGBA: Top/Left -> Bottom/Right
        let pos = row + col
        const r = src.readUInt8(pos)
        const g = src.readUInt8(pos + 1)
        const b = src.readUInt8(pos + 2)
        const a = src.readUInt8(pos + 3)

        // BGRA: Right/Left -> Top/Right
        pos = (rowEnd - row) + col
        dest.writeUInt8(b, pos)
        dest.writeUInt8(g, pos + 1)
        dest.writeUInt8(r, pos + 2)
        dest.writeUInt8(a, pos + 3)
      }
    }

    return dest
  }
}
