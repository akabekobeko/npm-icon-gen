import Fs from 'fs'

/**
 * It defines constants for the ICNS.
 * @type {Object}
 */
export const ICNS = {
  /**
   * Sizes required for the ICNS file.
   * @type {Array}
   */
  imageSizes: [16, 32, 64, 128, 256, 512, 1024],

  /**
   * The size of the ICNS header.
   * @type {Number}
   */
  headerSize: 8,

  /**
   * Identifier of the ICNS file, in ASCII "icns".
   * @type {Number}
   */
  fileID: 'icns',

  /**
   * Identifier of the images, Mac OS 8.x (l8mk, s8mk) is unsupported.
   * If icp4, icp5, icp6 is present, Icon will not be supported because it can not be set as Folder of Finder.
   *
   * @type {Array}
   */
  iconIDs: [
    // Nromal
    {id: 'is32', size: 16},
    {id: 'il32', size: 32},
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
}

/**
 * Generate the ICNS file from a PNG images.
 * However, Mac OS 8.x is unsupported.
 */
export default class ICNSGenerator {
  /**
   * Create the ICNS file from a PNG images.
   *
   * @param {Array.<ImageInfo>} images File informations..
   * @param {String}            dest   Output destination The path of ICNS file.
   * @param {Logger}            logger Logger.
   *
   * @return {Promise} Promise object.
   */
  static generate (images, dest, logger) {
    return new Promise((resolve, reject) => {
      logger.log('ICNS:')

      const size   = ICNSGenerator.fileSizeFromImages(images)
      const stream = Fs.createWriteStream(dest)
      stream.write(ICNSGenerator.createFileHeader(size), 'binary')

      for (let i = 0, max = ICNS.iconIDs.length; i < max; ++i) {
        const iconID = ICNS.iconIDs[i]
        if (!(ICNSGenerator.writeImage(iconID, images, stream))) {
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
   * Write the image.
   *
   * @param {Object}            iconID Identifier of the icon.
   * @param {Array.<ImageInfo>} images File informations..
   * @param {WritableStream}    stream Target stream.
   *
   * @return {Boolean} If success "true".
   */
  static writeImage (iconID, images, stream) {
    // Unknown target is ignored
    const image = ICNSGenerator.imageFromIconID(iconID, images)
    if (!(image)) {
      return true
    }

    const data = Fs.readFileSync(image.path)
    if (!(data)) {
      return false
    }

    const header = ICNSGenerator.createIconHeader(iconID, data.length)
    stream.write(header, 'binary')
    stream.write(data, 'binary')

    return true
  }

  /**
   * Select the image support to the icon.
   *
   * @param {Object}            iconID Identifier of the icon.
   * @param {Array.<ImageInfo>} images File informations..
   *
   * @return {ImageInfo} If successful image information, otherwise null.
   */
  static imageFromIconID (iconID, images) {
    let result = null
    images.some((image) => {
      if (image.size === iconID.size) {
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
  static createFileHeader (fileSize) {
    const b = Buffer.alloc(ICNS.headerSize)
    b.write(ICNS.fileID, 0, 'ascii')
    b.writeUInt32BE(fileSize, 4)

    return b
  }

  /**
   * Create the Icon header in ICNS file.
   *
   * @param {Object} iconID    Icon identifier.
   * @param {Number} imageSize Size of the image.
   *
   * @return {Buffer} Header data.
   */
  static createIconHeader (iconID, imageSize) {
    const buffer = Buffer.alloc(ICNS.headerSize)
    buffer.write(iconID.id, 0, 'ascii')
    buffer.writeUInt32BE(ICNS.headerSize + imageSize, 4)

    return buffer
  }

  /**
   * Calculate the size of the ICNS file.
   *
   * @param {Array.<ImageInfo>} images File informations.
   *
   * @return {Number} File size.
   */
  static fileSizeFromImages (images) {
    let size = 0
    ICNS.iconIDs.forEach((iconId) => {
      let path = null
      images.some((image) => {
        if (image.size === iconId.size) {
          path = image.path
          return true
        }

        return false
      })

      if (!(path)) {
        return
      }

      const stat = Fs.statSync(path)
      size += ICNS.headerSize + stat.size
    })

    // File header + body
    return ICNS.headerSize + size
  }
}
