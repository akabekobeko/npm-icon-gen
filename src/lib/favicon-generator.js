import Fs from 'fs'
import Path from 'path'
import Util from './util.js'
import ICOGenerator from './ico-generator.js'

/**
 * Sizes required for the FAVICON PNG files.
 * @type {Array.<Number>}
 */
const REQUIRED_PNG_IMAGE_SIZES =  [32, 57, 72, 96, 120, 128, 144, 152, 195, 228]

/**
 * Sizes required for the FAVICON ICO file.
 * @type {Array.<Number>}
 */
const REQUIRED_ICO_IMAGE_SIZES = [16, 24, 32, 48, 64]

/**
 * Sizes required for the FAVICON files.
 * @type {Array.<Number>}
 */
const REQUIRED_IMAGE_SIZES = REQUIRED_PNG_IMAGE_SIZES.concat(REQUIRED_ICO_IMAGE_SIZES)
  .filter((a, i, self) => self.indexOf(a) === i)
  .sort((a, b) => a - b)

/**
 * File name of the FAVICON file.
 * @type {String}
 */
const ICO_FILE_NAME = 'favicon'

/**
 * Collection of the file name and size of the icon.
 * @type {Array.<Object>}
 * @see https://github.com/audreyr/favicon-cheat-sheet
 */
const PNG_FILE_INFOS = [
  {name: 'favicon-32.png',  size: 32},  // Certain old but not too old Chrome versions mishandle ico
  {name: 'favicon-57.png',  size: 57},  // Standard iOS home screen (iPod Touch, iPhone first generation to 3G)
  {name: 'favicon-72.png',  size: 72},  // iPad home screen icon
  {name: 'favicon-96.png',  size: 96},  // GoogleTV icon
  {name: 'favicon-120.png', size: 120}, // iPhone retina touch icon (Change for iOS 7: up = require(114x114)
  {name: 'favicon-128.png', size: 128}, // Chrome Web Store icon
  {name: 'favicon-144.png', size: 144}, // IE10 Metro tile for pinned site
  {name: 'favicon-152.png', size: 152}, // iPad retina touch icon (Change for iOS 7: up = require(144x144)
  {name: 'favicon-195.png', size: 195}, // Opera Speed Dial icon
  {name: 'favicon-228.png', size: 228}  // Opera Coast icon
]

/**
 * Generate the FAVICON files = require(a PNG images.
 */
export default class FaviconGenerator {
  /**
   * Generate a FAVICON image files (ICO and PNG) from the PNG images.
   *
   * @param {Array.<ImageInfo>} images File information for the PNG files generation.
   * @param {String}            dir    Output destination the path of directory.
   * @param {Logger}            logger Logger.
   *
   * @return {Promise} Promise object.
   */
  static generate (images, dir, logger) {
    const results = []
    return Promise
      .resolve()
      .then(() => {
        return FaviconGenerator._generateICO(images, dir, logger)
      })
      .then((icoFile) => {
        results.push(icoFile)
        return FaviconGenerator._generatePNG(images, dir, logger)
      })
      .then((pngFiles) => {
        return results.concat(pngFiles)
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
   * Generate the FAVICON file from the PNG images.
   *
   * @param {Array.<ImageInfo>} images File information for the PNG files generation.
   * @param {String}            dir    Output destination the path of directory.
   * @param {Logger}            logger Logger.
   *
   * @return {Promise} Promise object.
   */
  static _generateICO (images, dir, logger) {
    const options = {names: {ico: ICO_FILE_NAME}}
    return ICOGenerator.generate(Util.filterImagesBySizes(images, REQUIRED_ICO_IMAGE_SIZES), dir, options, logger)
  }

  /**
   * Generate the FAVICON PNG file from the PNG images.
   *
   * @param {Array.<ImageInfo>} images File information for the PNG files generation.
   * @param {String}            dir    Output destination the path of directory.
   * @param {Logger}            logger Logger.
   *
   * @return {Promise} Promise object.
   */
  static _generatePNG (images, dir, logger) {
    return new Promise((resolve, reject) => {
      logger.log('Favicon:')

      // PNG
      const tasks = Util.filterImagesBySizes(images, REQUIRED_PNG_IMAGE_SIZES)
        .map((image) => {
          return FaviconGenerator._copyImage(image, dir, logger)
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
  static _copyImage (image, dir, logger) {
    return new Promise((resolve, reject) => {
      const fileName = FaviconGenerator._fileNameFromSize(image.size)
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
   * Get the file names corresponding to image size.
   *
   * @param {Number} size Size of an image.
   *
   * @return {String} If successful name, otherwise null.
   */
  static _fileNameFromSize (size) {
    let name = null
    PNG_FILE_INFOS.some((png) => {
      if (png.size === size) {
        name = png.name
        return true
      }

      return false
    })

    return name
  }
}
