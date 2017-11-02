import Fs from 'fs'
import Path from 'path'
import Util from './util.js'

/**
 * Sizes required for the ICNS file.
 * @type {Array}
 */
const REQUIRED_IMAGE_SIZES = [32, 64, 128, 256, 512, 1024]

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
 * @type {Array}
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
  {id: 'ic14', size: 512}
]

/**
 * Generate the ICNS file from a PNG images.
 * However, Mac OS 8.x is unsupported.
 */
export default class ICNSGenerator {
  /**
   * Create the ICNS file from a PNG images.
   *
   * @param {Array.<ImageInfo>} images File informations..
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
      const size    = ICNSGenerator._fileSizeFromImages(targets)
      const stream  = Fs.createWriteStream(dest)
      stream.write(ICNSGenerator._createFileHeader(size), 'binary')

      for (let i = 0, max = ICON_INFOS.length; i < max; ++i) {
        const info = ICON_INFOS[i]
        if (!(ICNSGenerator._writeImage(info, targets, stream))) {
          stream.end()
          reject(new Error('Faild to read/write image.'))
          return
        }
      }

      stream.end()

      logger.log('  Create: ' + dest)
      resolve(dest)
    })
  }

  /**
   * Get the size of the required PNG.
   * 
   * @return {{Array.<Number>}} Sizes.
   */
  static getRequiredImageSizes () {
    return REQUIRED_IMAGE_SIZES
  }

  /**
   * Write the image.
   *
   * @param {Object}            info   Information of the icon.
   * @param {Array.<ImageInfo>} images File informations..
   * @param {WritableStream}    stream Target stream.
   *
   * @return {Boolean} If success "true".
   */
  static _writeImage (info, images, stream) {
    // Unknown target is ignored
    const image = ICNSGenerator._imageFromIconID(info, images)
    if (!(image)) {
      return true
    }

    const data = Fs.readFileSync(image.path)
    if (!(data)) {
      return false
    }

    const header = ICNSGenerator._createIconHeader(info, data.length)
    stream.write(header, 'binary')
    stream.write(data, 'binary')

    return true
  }

  /**
   * Select the image support to the icon.
   *
   * @param {Object}            info   Information of the icon.
   * @param {Array.<ImageInfo>} images File informations..
   *
   * @return {ImageInfo} If successful image information, otherwise null.
   */
  static _imageFromIconID (info, images) {
    let result = null
    images.some((image) => {
      if (image.size === info.size) {
        result = image
        return true
      }

      return false
    })

    return result
  }

  /**
   * Create the ICNS file header.
   *
   * @param {Number} fileSize File size.
   *
   * @return {Buffer} Header data.
   */
  static _createFileHeader (fileSize) {
    const b = Buffer.alloc(HEADER_SIZE)
    b.write(FILE_HEADER_ID, 0, 'ascii')
    b.writeUInt32BE(fileSize, 4)

    return b
  }

  /**
   * Create the Icon header in ICNS file.
   *
   * @param {Object} info      Infromation of the icon.
   * @param {Number} imageSize Size of the image data.
   *
   * @return {Buffer} Header data.
   */
  static _createIconHeader (info, imageSize) {
    const buffer = Buffer.alloc(HEADER_SIZE)
    buffer.write(info.id, 0, 'ascii')
    buffer.writeUInt32BE(HEADER_SIZE + imageSize, 4)

    return buffer
  }

  /**
   * Calculate the size of the ICNS file.
   *
   * @param {Array.<ImageInfo>} images File informations.
   *
   * @return {Number} File size.
   */
  static _fileSizeFromImages (images) {
    let size = 0
    ICON_INFOS.forEach((info) => {
      let path = null
      images.some((image) => {
        if (image.size === info.size) {
          path = image.path
          return true
        }

        return false
      })

      if (!(path)) {
        return
      }

      const stat = Fs.statSync(path)
      size += HEADER_SIZE + stat.size
    })

    // File header + body
    return HEADER_SIZE + size
  }
}
