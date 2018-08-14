import Fs from 'fs'
import Path from 'path'
import SVG2PNG from 'svg2png'
import FaviconGenerator from './favicon-generator.js'
import ICNSGenerator from './icns-generator.js'
import ICOGenerator from './ico-generator.js'

/**
 * Filter the sizes.
 *
 * @param {Number[]} sizes Original sizes.
 * @param {Number[]} filterSizes Filter sizes.
 *
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
 * Generate the PNG files = require(SVG file.
 */
export default class PNGGenerator {
  /**
   * Generate the PNG files = require(the SVG file.
   *
   * @param {String} src SVG file path.
   * @param {String} dir Output destination The path of directory.
   * @param {CLIOption} options Options from command line.
   * @param {Function} cb Callback function.
   * @param {Logger} logger Logger.
   */
  static generate (src, dir, options, cb, logger) {
    Fs.readFile(src, (err, svg) => {
      if (err) {
        cb(err)
        return
      }

      logger.log('SVG to PNG:')

      const sizes = PNGGenerator.getRequiredImageSizes(options)
      Promise
        .all(sizes.map((size) => {
          return PNGGenerator._generatePNG(svg, size, dir, logger)
        }))
        .then((results) => {
          cb(null, results)
        })
        .catch((err2) => {
          cb(err2)
        })
    })
  }

  /**
   * Gets the size of the images needed to create an icon.
   *
   * @param {CLIOption} options Options from command line.
   *
   * @return {Number[]} The sizes of the image.
   */
  static getRequiredImageSizes (options = {}) {
    let sizes = []
    if (options.modes && 0 < options.modes.length) {
      options.modes.forEach((mode) => {
        switch (mode) {
          case 'icns':
            sizes = sizes.concat(filterSizes(ICNSGenerator.getRequiredImageSizes(), options.sizes && options.sizes.icns))
            break

          case 'ico':
            sizes = sizes.concat(filterSizes(ICOGenerator.getRequiredImageSizes(), options.sizes && options.sizes.ico))
            break

          case 'favicon':
            sizes = sizes.concat(FaviconGenerator.getRequiredImageSizes())
            break

          default:
            break
        }
      })
    }

    // 'all' mode
    if (sizes.length === 0) {
      sizes = FaviconGenerator.getRequiredImageSizes()
      sizes = sizes.concat(filterSizes(ICNSGenerator.getRequiredImageSizes(), options.sizes && options.sizes.icns))
      sizes = sizes.concat(filterSizes(ICOGenerator.getRequiredImageSizes(), options.sizes && options.sizes.ico))
    }

    return sizes
      .filter((value, index, array) => {
        return (array.indexOf(value) === index)
      })
      .sort((a, b) => {
      // Always ensure the ascending order
        return (a - b)
      })
  }

  /**
   * Generate the PNG file = require(the SVG data.
   *
   * @param {Buffer} svg SVG data that has been parse by svg2png.
   * @param {Number} size The size (width/height) of the image.
   * @param {String} dir Path of the file output directory.
   * @param {Logger} logger Logger.
   *
   * @return {Promise} Image generation task.
   */
  static _generatePNG (svg, size, dir, logger) {
    return new Promise((resolve, reject) => {
      if (!(svg && 0 < size && dir)) {
        reject(new Error('Invalid parameters.'))
        return
      }

      const dest = Path.join(dir, size + '.png')
      logger.log('  Create: ' + dest)

      const buffer = SVG2PNG.sync(svg, { width: size, height: size })
      if (!(buffer)) {
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
}
