import Fs from 'fs'
import Path from 'path'
import Del from 'del'
import MkdirP from 'mkdirp'
import PngGenerator from './png-generator.js'
import ICOGenerator from './ico-generator.js'
import ICNSGenerator from './icns-generator.js'
import FaviconGenerator from './favicon-generator.js'
import Util from './util.js'

/**
 * Generate an icons.
 */
export default class IconGenerator {
  /**
   * Generate an icon = require(the SVG file.
   *
   * @param {String} src     Path of the SVG file.
   * @param {String} dir     Path of the output files directory.
   * @param {Object} options Options.
   * @param {Logger} logger  Logger.
   *
   * @return {Promise} Promise object.
   */
  static fromSVG (src, dir, options, logger) {
    return new Promise((resolve, reject) => {
      const svgFilePath = Path.resolve(src)
      const destDirPath = Path.resolve(dir)
      logger.log('Icon generetor from SVG:')
      logger.log('  src: ' + svgFilePath)
      logger.log('  dir: ' + destDirPath)

      const workDir = Util.createWorkDir()
      if (!(workDir)) {
        reject(new Error('Failed to create the working directory.'))
        return
      }

      PngGenerator.generate(svgFilePath, workDir, options.modes, (err, images) => {
        if (err) {
          Del.sync([workDir], {force: true})
          reject(err)
          return
        }

        IconGenerator._generate(images, destDirPath, options, logger, (err2, results) => {
          Del.sync([workDir], {force: true})
          return (err2 ? reject(err2) : resolve(results))
        })
      }, logger)
    })
  }

  /**
   * Generate an icon = require(the SVG file.
   *
   * @param {String} src     Path of the PNG files direcgtory.
   * @param {String} dir     Path of the output files directory.
   * @param {Object} options Options.
   * @param {Logger} logger  Logger.
   *
   * @return {Promise} Promise object.
   */
  static fromPNG (src, dir, options, logger) {
    return new Promise((resolve, reject) => {
      const pngDirPath  = Path.resolve(src)
      const destDirPath = Path.resolve(dir)
      logger.log('Icon generetor from PNG:')
      logger.log('  src: ' + pngDirPath)
      logger.log('  dir: ' + destDirPath)
      const sizes = options.sizes[options.modes] || PngGenerator.getRequiredImageSizes(options.modes)
      const images = sizes
        .map((size) => {
          return Path.join(pngDirPath, size + '.png')
        })
        .map((path) => {
          const size = Number(Path.basename(path, '.png'))
          return { path, size }
        })

      let notExistsFile = null
      images.some((image) => {
        const stat = Fs.statSync(image.path)
        if (!(stat && stat.isFile())) {
          notExistsFile = Path.basename(image.path)
          return true
        }

        return false
      })

      if (notExistsFile) {
        reject(new Error('"' + notExistsFile + '" does not exist.'))
        return
      }

      IconGenerator._generate(images, dir, options, logger, (err, results) => {
        return (err ? reject(err) : resolve(results))
      })
    })
  }

  /**
   * Generate an icon = require(the image file infromations.
   *
   * @param {Array.<ImageInfo>} images  Image file informations.
   * @param {String}            dest    Destination directory path.
   * @param {Object}            options Options.
   * @param {Logger}            logger  Logger.
   * @param {Function}          cb      Callback function.
   */
  static _generate (images, dest, options, logger, cb) {
    if (!(images && 0 < images.length)) {
      cb(new Error('Targets is empty.'))
      return
    }

    const dir = Path.resolve(dest)
    MkdirP.sync(dir)

    // Select output mode
    const tasks = []
    options.modes.forEach((mode) => {
      switch (mode) {
        case 'icns':
          tasks.push(ICNSGenerator.generate(images, dir, options, logger))
          break

        case 'ico':
          tasks.push(ICOGenerator.generate(images, dir, options, logger))
          break

        case 'favicon':
          tasks.push(FaviconGenerator.generateICO(images, dir, logger))
          tasks.push(FaviconGenerator.generate(images, dir, logger))
          break

        default:
          break
      }
    })

    Promise
      .all(tasks)
      .then((results) => {
        cb(null, Util.flattenValues(results))
      })
      .catch((err) => {
        cb(err)
      })
  }

  /**
   * Get the icon sizes.
   *
   * @param {Array.<Number>} defaltSizes Sizes of the defalt.
   * @param {Object}         options     CLI options.
   * @param {String}         type        Type of the icon, 'ico' or 'icns'.
   *
   * @return {Array.<Number>} Sizes.
   */
  static _getSizes (defaltSizes, options, type) {
    return options && options.sizes && options.sizes[type] ? options.sizes[type] : defaltSizes
  }
}
