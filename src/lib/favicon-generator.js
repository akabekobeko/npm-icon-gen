const Fs = require('fs')
const Path = require('path')
const Logger = require('./logger.js')
const IcoGenerator = require('./ico-generator.js')
const Favicon = require('./constants.js').Favicon

/**
 * Generate a FAVICON files = require(a PNG images.
 */
class FaviconGenerator {
  /**
   * Create a FAVICON image files = require(a PNG images.
   *
   * @param {Array.<ImageInfo>} images File information for the PNG files generation.
   * @param {String}            dir    Output destination The path of directory.
   * @param {Logger}            logger Logger.
   *
   * @return {Promise} Promise object.
   */
  static generate (images, dir, logger) {
    return new Promise((resolve, reject) => {
      logger.log('Favicon:')

      // PNG
      const tasks = images.map((image) => {
        return FaviconGenerator.copyImage(image, dir, logger)
      })

      Promise
      .all(tasks)
      .then((results) => {
        resolve(results)
      })
      .catch((err) => {
        reject(err)
      })
    })
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
  static copyImage (image, dir, logger) {
    return new Promise((resolve, reject) => {
      const fileName = FaviconGenerator.fileNameFromSize(image.size)
      if (!(fileName)) {
        // Unknown target is ignored
        resolve('')
        return
      }

      const reader = Fs.createReadStream(image.path)
      .on('error', (err) => {
        reject(err)
      })

      const dest   = Path.join(dir, fileName)
      const writer = Fs.createWriteStream(dest)
      .on('error', (err) => {
        reject(err)
      })
      .on('close', () => {
        logger.log('  Create: ' + dest)
        resolve(dest)
      })

      reader.pipe(writer)
    })
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
  static generateICO (images, dir, logger) {
    return new Promise((resolve, reject) => {
      const dest = Path.join(dir, Favicon.icoFileName)
      IcoGenerator.generate(images, dest, (err) => {
        if (err) {
          return reject(err)
        }

        logger.log('  Create: ' + dest)
        return resolve(dest)
      }, new Logger())
    })
  }

  /**
   * Get the file names corresponding to image size.
   *
   * @param {Number} size Size of an image.
   *
   * @return {String} If successful name, otherwise null.
   */
  static fileNameFromSize (size) {
    let name = null
    Favicon.pngFiles.some((pngFile) => {
      if (pngFile.size === size) {
        name = pngFile.name
        return true
      }

      return false
    })

    return name
  }
}

module.exports = FaviconGenerator
