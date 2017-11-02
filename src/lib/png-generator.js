import Fs from 'fs'
import Path from 'path'
import SVG2PNG from 'svg2png'
import FaviconGenerator from './favicon-generator.js'
import ICNSGenerator from './icns-generator.js'
import ICOGenerator from './ico-generator.js'

/**
 * Generate the PNG files = require(SVG file.
 */
export default class PNGGenerator {
  /**
   * Generate the PNG files = require(the SVG file.
   *
   * @param {String}         src    SVG file path.
   * @param {String}         dir    Output destination The path of directory.
   * @param {Array.<String>} modes  Modes of an output files.
   * @param {Function}       cb     Callback function.
   * @param {Logger}         logger Logger.
   */
  static generate (src, dir, modes, cb, logger) {
    Fs.readFile(src, (err, svg) => {
      if (err) {
        cb(err)
        return
      }

      logger.log('SVG to PNG:')

      const sizes = PNGGenerator.getRequiredImageSizes(modes)
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
   * @param {Array.<String>} modes Modes of an output files.
   *
   * @return {Array.<Number>} The sizes of the image.
   */
  static getRequiredImageSizes (modes) {
    let sizes = []
    if (modes && 0 < modes.length) {
      modes.forEach((mode) => {
        switch (mode) {
          case 'icns':
            sizes = sizes.concat(ICNSGenerator.getRequiredImageSizes())
            break

          case 'ico':
            sizes = sizes.concat(ICOGenerator.getRequiredImageSizes())
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
      sizes = FaviconGenerator.getRequiredImageSizes().concat(ICNSGenerator.getRequiredImageSizes().concat(ICOGenerator.getRequiredImageSizes()))
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
   * @param {Buffer} svg    SVG data that has been parse by svg2png.
   * @param {Number} size   The size (width/height) of the image.
   * @param {String} dir    Path of the file output directory.
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
