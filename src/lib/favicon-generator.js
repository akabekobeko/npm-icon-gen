import Fs from 'fs'
import Path from 'path'
import Util from './util.js'
import GenerateICO from './ico-generator.js'

/**
 * Sizes required for the PNG files.
 * @type {Number[]}
 */
const REQUIRED_PNG_IMAGE_SIZES = [32, 57, 72, 96, 120, 128, 144, 152, 195, 228]

/**
 * Sizes required for ICO file.
 * @type {Number[]}
 */
const REQUIRED_ICO_IMAGE_SIZES = [16, 24, 32, 48, 64]

/**
 * Sizes required for Favicon files.
 * @type {Number[]}
 */
const REQUIRED_IMAGE_SIZES = REQUIRED_PNG_IMAGE_SIZES.concat(REQUIRED_ICO_IMAGE_SIZES)
  .filter((a, i, self) => self.indexOf(a) === i)
  .sort((a, b) => a - b)

/**
 * File name of Favicon file.
 * @type {String}
 */
const ICO_FILE_NAME = 'favicon'

/**
 * Prefix of PNG file names.
 * @type {String}
 */
const PNG_FILE_NAME_PREFIX = 'favicon-'

/**
 * Copy to image.
 * @param {ImageInfo} image Image information.
 * @param {String} dir Output destination The path of directory.
 * @param {String} prefix Prefix of an output PNG files. Start with the alphabet, can use `-` and `_`. This option is for PNG. The name of the ICO file is always `favicon.ico`.
 * @param {Logger} logger Logger.
 * @return {Promise} Task to copy an image.
 */
const copyImage = (image, dir, prefix, logger) => {
  return new Promise((resolve, reject) => {
    const reader = Fs.createReadStream(image.path).on('error', (err) => {
      reject(err)
    })

    const dest = Path.join(dir, `${prefix}${image.size}.png`)
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
 * Generate the FAVICON PNG file from the PNG images.
 * @param {ImageInfo[]} images File information for the PNG files generation.
 * @param {String} dir Output destination the path of directory.
 * @param {String} prefix Prefix of an output PNG files. Start with the alphabet, can use `-` and `_`. This option is for PNG. The name of the ICO file is always `favicon.ico`.
 * @param {Number[]} sizes Size structure of PNG files to output.
 * @param {Logger} logger Logger.
 * @return {Promise} Promise object.
 */
const generatePNG = (images, dir, prefix, sizes, logger) => {
  return new Promise((resolve, reject) => {
    logger.log('Favicon:')

    // PNG
    const tasks = Util.filterImagesBySizes(images, sizes).map((image) => {
      return copyImage(image, dir, prefix, logger)
    })

    Promise.all(tasks)
      .then((results) => {
        resolve(results)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

/**
 * Generate the FAVICON file from the PNG images.
 * @param {ImageInfo[]} images File information for the PNG files generation.
 * @param {String} dir Output destination the path of directory.
 * @param {Number[]} sizes Structure of an image sizes for ICO.
 * @param {Logger} logger Logger.
 * @return {Promise} Promise object.
 */
const generateICO = (images, dir, sizes, logger) => {
  const options = { name: ICO_FILE_NAME, sizes: sizes }
  return GenerateICO(Util.filterImagesBySizes(images, sizes), dir, options, logger)
}

/**
 * Check an option properties.
 * @param {Object} options Options.
 * @param {String} options.name Prefix of an output PNG files. Start with the alphabet, can use `-` and `_`. This option is for PNG. The name of the ICO file is always `favicon.ico`.
 * @param {Number[]} options.sizes Size structure of PNG files to output.
 * @param {Number[]} options.ico Structure of an image sizes for ICO.
 * @returns {Object} Checked options.
 */
const checkOptions = (options) => {
  if (options) {
    return {
      name: typeof options.name === 'string' ? options.name : PNG_FILE_NAME_PREFIX,
      sizes: Array.isArray(options.sizes) ? options.sizes : REQUIRED_PNG_IMAGE_SIZES,
      ico: Array.isArray(options.ico) ? options.ico : REQUIRED_ICO_IMAGE_SIZES
    }
  } else {
    return {
      name: PNG_FILE_NAME_PREFIX,
      sizes: REQUIRED_PNG_IMAGE_SIZES,
      ico: REQUIRED_ICO_IMAGE_SIZES
    }
  }
}

/**
 * Get the size of the required PNG.
 * @return {Number[]} Sizes.
 */
export const GetRequiredFavoriteImageSizes = () => {
  return REQUIRED_IMAGE_SIZES
}

/**
 * Generate a FAVICON image files (ICO and PNG) from the PNG images.
 * @param {ImageInfo[]} images File information for the PNG files generation.
 * @param {String} dir Output destination the path of directory.
 * @param {Object} options Options.
 * @param {String} options.name Prefix of an output PNG files. Start with the alphabet, can use `-` and `_`. This option is for PNG. The name of the ICO file is always `favicon.ico`.
 * @param {Number[]} options.sizes Size structure of PNG files to output.
 * @param {Number[]} options.ico Structure of an image sizes for ICO.
 * @param {Logger} logger Logger.
 * @return {Promise} Promise object.
 */
const GenerateFavicon = (images, dir, options, logger) => {
  const opt = checkOptions(options)
  const results = []
  return Promise.resolve()
    .then(() => {
      return generateICO(images, dir, opt.ico, logger)
    })
    .then((icoFile) => {
      results.push(icoFile)
      return generatePNG(images, dir, opt.name, opt.sizes, logger)
    })
    .then((pngFiles) => {
      return results.concat(pngFiles)
    })
}

export default GenerateFavicon
