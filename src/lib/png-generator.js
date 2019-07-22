import Fs from 'fs'
import Path from 'path'
import SVG2PNG from 'svg2png'
import { GetRequiredFavoriteImageSizes } from './favicon-generator.js'
import { GetRequiredICNSImageSizes } from './icns-generator.js'
import { GetRequiredICOImageSizes } from './ico-generator.js'

/**
 * Filter the sizes.
 * @param {Number[]} sizes Original sizes.
 * @param {Number[]} filterSizes Filter sizes. *
 * @return {NUmber[]} Filterd sizes.
 */
const filterSizes = (sizes = [], filterSizes = []) => {
  if (filterSizes.length === 0) {
    return sizes
  }

  return sizes.filter((size) => {
    for (let filterSize of filterSizes) {
      if (size === filterSize) {
        return true
      }
    }

    return false
  })
}

/**
 * Generate the PNG file = require(the SVG data.
 * @param {Buffer} svg SVG data that has been parse by svg2png.
 * @param {Number} size The size (width/height) of the image.
 * @param {String} dir Path of the file output directory.
 * @param {Logger} logger Logger.
 * @return {Promise} Image generation task.
 */
const generatePNG = (svg, size, dir, logger) => {
  return new Promise((resolve, reject) => {
    if (!(svg && 0 < size && dir)) {
      reject(new Error('Invalid parameters.'))
      return
    }

    const dest = Path.join(dir, size + '.png')
    logger.log('  Create: ' + dest)

    const buffer = SVG2PNG.sync(svg, { width: size, height: size })
    if (!buffer) {
      reject(new Error('Faild to write the image, ' + size + 'x' + size))
      return
    }

    Fs.writeFile(dest, buffer, (err) => {
      if (err) {
        reject(err)
        return
      }

      resolve({ size: size, path: dest })
    })
  })
}

/**
 * Gets the size of the images needed to create an icon.
 * @param {CLIOption} options Options from command line.
 * @return {Number[]} The sizes of the image.
 */
export const GetRequiredPNGImageSizes = (options = {}) => {
  let sizes = []
  if (options.icns) {
    sizes = sizes.concat(filterSizes(GetRequiredICNSImageSizes(), options.icns.sizes))
  }

  if (options.ico) {
    sizes = sizes.concat(filterSizes(GetRequiredICOImageSizes(), options.ico.sizes))
  }

  if (options.favicon) {
    if (options.favicon.sizes) {
      // Favicon's PNG generates the specified size as it is
      sizes = sizes.concat(options.favicon.sizes)
    } else {
      sizes = sizes.concat(GetRequiredFavoriteImageSizes())
    }
  }

  // 'all' mode
  if (sizes.length === 0) {
    sizes = GetRequiredFavoriteImageSizes()
    sizes = sizes.concat(filterSizes(GetRequiredICNSImageSizes(), options.sizes && options.sizes.icns))
    sizes = sizes.concat(filterSizes(GetRequiredICOImageSizes(), options.sizes && options.sizes.ico))
  }

  return sizes
    .filter((value, index, array) => {
      return array.indexOf(value) === index
    })
    .sort((a, b) => {
      // Always ensure the ascending order
      return a - b
    })
}

/**
 * Generate the PNG files = require(the SVG file.
 * @param {String} src SVG file path.
 * @param {String} dir Output destination The path of directory.
 * @param {CLIOption} options Options from command line.
 * @param {Function} cb Callback function.
 * @param {Logger} logger Logger.
 */
const GeneratePNG = (src, dir, options, cb, logger) => {
  Fs.readFile(src, (err, svg) => {
    if (err) {
      cb(err)
      return
    }

    logger.log('SVG to PNG:')

    const sizes = GetRequiredPNGImageSizes(options)
    Promise.all(
      sizes.map((size) => {
        return generatePNG(svg, size, dir, logger)
      })
    )
      .then((results) => {
        cb(null, results)
      })
      .catch((err2) => {
        cb(err2)
      })
  })
}

export default GeneratePNG
