import Fs from 'fs'
import Path from 'path'
import Util from './util.js'
import {PNG} from 'pngjs'
import PackBits from './packbits.js'
import { Buffer } from 'buffer'
import { Promise } from 'es6-promise'

/**
 * Sizes required for the ICNS file.
 * @type {Array}
 */
const REQUIRED_IMAGE_SIZES = [16, 32, 64, 128, 256, 512, 1024]

/**
 * The size of the ICNS header.
 * @type {Number}
 */
const HEADER_SIZE = 8

/**
 * Identifier of the ICNS file, in ASCII "icns".
 * @type {Number}
 */
const FILE_HEADER_ID = 'icns'

/**
 * ICNS file extension.
 * @type {String}
 */
const FILE_EXTENSION = '.icns'

/**
 * Information of the images, Mac OS 8.x (il32, is32, l8mk, s8mk) is unsupported.
 * If icp4, icp5, icp6 is present, Icon will not be supported because it can not be set as Folder of Finder.
 *
 * @type {Array.<ICNSIconInfo>}
 */
const ICON_INFOS = [
  // Normal
  {id: 'ic07', size: 128},
  {id: 'ic08', size: 256},
  {id: 'ic09', size: 512},
  {id: 'ic10', size: 1024},

  // Retina
  {id: 'ic11', size: 32},
  {id: 'ic12', size: 64},
  {id: 'ic13', size: 256},
  {id: 'ic14', size: 512},

  // Mac OS 8.5
  {id: 'is32', mask: 's8mk', size: 16},
  {id: 'il32', mask: 'l8mk', size: 32}
]

/**
 * Generate the ICNS file from a PNG images.
 * However, Mac OS 8.x is unsupported.
 */
export default class ICNSGenerator {
  /**
   * Create the ICNS file from a PNG images.
   *
   * @param {Array.<ImageInfo>} images Information of the image files.
   * @param {String}            dir     Output destination the path of directory.
   * @param {Object}            options Options.
   * @param {Logger}            logger  Logger.
   *
   * @return {Promise} Promise object.
   */
  static generate (images, dir, options, logger) {
    return new Promise((resolve, reject) => {
      logger.log('ICNS:')

      const dest    = Path.join(dir, options.names.icns + FILE_EXTENSION)
      const targets = Util.filterImagesBySizes(images, Util.checkImageSizes(REQUIRED_IMAGE_SIZES, options, 'icns'))

      if (ICNSGenerator._createIcon(targets, dest)) {
        logger.log('  Create: ' + dest)
        resolve(dest)
      } else {
        Fs.unlinkSync(dest)
        reject(new Error('Faild to read/write image.'))
      }
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
   * Creat a file header and icon blocks.
   *
   * @param {Array.<ImageInfo>} images Information of the image files.
   * @param {String}            dest   The path of the output destination file.
   *
   * @return {Boolean} "true" if it succeeds.
   */
  static _createIcon (images, dest) {
    // Write a temporary file size
    let fileSize = HEADER_SIZE
    let stream   = Fs.createWriteStream(dest)
    stream.write(ICNSGenerator._createFileHeader(fileSize), 'binary')

    for (let i = 0, max = ICON_INFOS.length; i < max; ++i) {
      const info = ICON_INFOS[i]
      const image = ICNSGenerator._imageFromIconSize(info.size, images)
      if (!(image)) {
        // Depending on the command line option, there may be no corresponding size
        continue
      }

      let block = null
      switch (info.id) {
        case 'is32':
        case 'il32':
          block = ICNSGenerator._createIconBlockPackBits(info.id, info.mask, Fs.readFileSync(image.path))
          break

        default:
          block = ICNSGenerator._createIconBlock(info.id, Fs.readFileSync(image.path))
          break
      }

      if (block) {
        stream.write(block, 'binary')
        fileSize += block.length
      } else {
        fileSize = 0
        break
      }
    }

    stream.end()

    if (fileSize === 0) {
      return false
    }

    // Update an actual file size
    stream = Fs.createWriteStream(dest)
    stream.write(ICNSGenerator._createFileHeader(fileSize), 'binary')
    stream.end()

    return true
  }

  /**
   * Create an icon block's data.
   *
   * @param {String} id   Identifier of the icon.
   * @param {Buffer} data Body data of the icon.
   *
   * @return {Buffer} data.
   */
  static _createIconBlock (id, data) {
    if (!(data)) {
      return null
    }

    const header = ICNSGenerator._createIconHeader(id, data.length)
    return Buffer.concat([header, data], header.length + data.length)
  }

  /**
   * Create an icon blocks (Color and mask) for PackBits.
   *
   * @param {String} id    Identifier of the icon (color block).
   * @param {String} mask  Identifier of the icon (mask block).
   * @param {Buffer} data Binary of the PNG image.
   *
   * @return {Buffer} If successful it wrote the icon block. "null" on failure.
   */
  static _createIconBlockPackBits (id, mask, data) {
    const bodies = ICNSGenerator._createIconBlockPackBitsBodies(data)
    if (!(bodies)) {
      return null
    }

    const colorBlock = ICNSGenerator._createIconBlock(id, Buffer.from(bodies.color))
    const maskBlock  = ICNSGenerator._createIconBlock(mask, Buffer.from(bodies.mask))

    return Buffer.concat([colorBlock, maskBlock], colorBlock.length + maskBlock.length)
  }

  /**
   * Create a color and mask data.
   *
   * @param {ImageInfo} image Information of the image.
   *
   * @return {Object} Bodies, "color" is a color (Compressed by PackBits), "mask" is a mask.
   */
  static _createIconBlockPackBitsBodies (data) {
    if (!(data)) {
      return null
    }

    const png     = PNG.sync.read(data)
    const results = {color: [], mask: []}
    const r = []
    const g = []
    const b = []

    for (let i = 0, max = png.data.length; i < max; i += 4) {
      // RGB
      r.push(png.data.readUInt8(i))
      g.push(png.data.readUInt8(i + 1))
      b.push(png.data.readUInt8(i + 2))

      // Alpha
      results.mask.push(png.data.readUInt8(i + 3))
    }

    // Compress
    results.color = results.color.concat(PackBits.pack(r.color))
    results.color = results.color.concat(PackBits.pack(g.color))
    results.color = results.color.concat(PackBits.pack(b.color))

    return results
  }

  /**
   * Create the ICNS file header.
   *
   * @param {Number} fileSize File size.
   *
   * @return {Buffer} Header data.
   */
  static _createFileHeader (fileSize) {
    const buffer = Buffer.alloc(HEADER_SIZE)
    buffer.write(FILE_HEADER_ID, 0, 'ascii')
    buffer.writeUInt32BE(fileSize, 4)

    return buffer
  }

  /**
   * Create the Icon header in ICNS file.
   *
   * @param {Object} id        Identifier of the icon.
   * @param {Number} imageSize Size of the image data.
   *
   * @return {Buffer} Header data.
   */
  static _createIconHeader (id, imageSize) {
    const buffer = Buffer.alloc(HEADER_SIZE)
    buffer.write(id, 0, 'ascii')
    buffer.writeUInt32BE(HEADER_SIZE + imageSize, 4)

    return buffer
  }

  /**
   * Select the support image from the icon size.
   *
   * @param {Number}            size   Sizo of icon.
   * @param {Array.<ImageInfo>} images File informations..
   *
   * @return {ImageInfo} If successful image information, otherwise null.
   */
  static _imageFromIconSize (size, images) {
    let result = null
    images.some((image) => {
      if (image.size === size) {
        result = image
        return true
      }

      return false
    })

    return result
  }

  /**
   * Unpack an icon block files from ICNS file (For debug).
   *
   * @param {String} src  Path of the ICNS file.
   * @param {String} dest Path of directory to output icon block files.
   *
   * @return {Promise} Promise object.
   */
  static _debugUnpackIconBlocks (src, dest) {
    return new Promise((resolve, reject) => {
      Fs.readFile(src, (err, data) => {
        if (err) {
          return reject(err)
        }

        for (let pos = HEADER_SIZE, max = data.length; pos < max;) {
          const header = data.slice(pos, pos + HEADER_SIZE)
          const id     = header.toString('ascii', 0, 4)
          const size   = header.readUInt32BE(4)

          pos += HEADER_SIZE
          const body  = data.slice(pos, pos + size)
          Fs.writeFileSync(Path.join(dest, id + '.header'), header, 'binary')
          Fs.writeFileSync(Path.join(dest, id + '.body'), body, 'binary')

          pos += size - HEADER_SIZE
        }

        resolve()
      })
    })
  }
}
