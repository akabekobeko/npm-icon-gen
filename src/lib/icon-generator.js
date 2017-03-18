const Fs = require('fs')
const Path = require('path')
const Del = require('del')
const MkdirP = require('mkdirp')
const PngGenerator = require('./png-generator.js')
const ICOGenerator = require('./ico-generator.js')
const ICNSGenerator = require('./icns-generator.js')
const FaviconGenerator = require('./favicon-generator.js')
const ICO = require('./constants.js').ICO
const ICNS = require('./constants.js').ICNS
const Favicon = require('./constants.js').Favicon
const CLI = require('../bin/constants.js').CLI

/**
 * Generate an icons.
 */
class IconGenerator {
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

      const workDir = PngGenerator.createWorkDir()
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

        IconGenerator.generate(images, destDirPath, options, logger, (err2, results) => {
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

      const images = PngGenerator.getRequiredImageSizes(options.modes)
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

      IconGenerator.generate(images, dir, options, logger, (err, results) => {
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
  static generate (images, dest, options, logger, cb) {
    if (!(images && 0 < images.length)) {
      cb(new Error('Targets is empty.'))
      return
    }

    const dir = Path.resolve(dest)
    MkdirP.sync(dir)

    // Select output mode
    const tasks = []
    let   path  = null
    options.modes.forEach((mode) => {
      switch (mode) {
        case CLI.modes.ico:
          path = Path.join(dir, options.names.ico + '.ico')
          tasks.push(ICOGenerator.generate(IconGenerator.filter(images, ICO.imageSizes), path, logger))
          break

        case CLI.modes.icns:
          path = Path.join(dir, options.names.icns + '.icns')
          tasks.push(ICNSGenerator.generate(IconGenerator.filter(images, ICNS.imageSizes), path, logger))
          break

        case CLI.modes.favicon:
          path = Path.join(dir, 'favicon.ico')
          tasks.push(ICOGenerator.generate(IconGenerator.filter(images, Favicon.icoImageSizes), path, logger))
          tasks.push(FaviconGenerator.generate(IconGenerator.filter(images, Favicon.imageSizes), dir, logger))
          break

        default:
          break
      }
    })

    Promise
    .all(tasks)
    .then((results) => {
      cb(null, IconGenerator.flattenValues(results))
    })
    .catch((err) => {
      cb(err)
    })
  }

  /**
   * Filter by size to the specified image informations.
   *
   * @param {Array.<ImageInfo>} images Image file informations.
   * @param {Array.<Number>}    sizes  Required sizes.
   *
   * @return {Array.<ImageInfo>} Filtered image informations.
   */
  static filter (images, sizes) {
    return images
    .filter((image) => {
      return sizes.some((size) => {
        return (image.size === size)
      })
    })
    .sort((a, b) => {
      return (a.size - b.size)
    })
  }

  /**
   * Convert a values to a flat array.
   *
   * @param  {Array.<String|Array>} values Values ([ 'A', 'B', [ 'C', 'D' ] ]).
   *
   * @return {Array.<String>} Flat array ([ 'A', 'B', 'C', 'D' ]).
   */
  static flattenValues (values) {
    const paths = []
    values.forEach((value) => {
      if (!(value)) {
        return
      }

      if (Array.isArray(value)) {
        value.forEach((path) => {
          paths.push(path)
        })
      } else {
        paths.push(value)
      }
    })

    return paths
  }
}

module.exports = IconGenerator
