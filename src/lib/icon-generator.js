import Fs from 'fs'
import Path from 'path'
import Del from 'del'
import MkdirP from 'mkdirp'
import GeneratePNG, { GetRequiredPNGImageSizes } from './png-generator.js'
import GenerateICO from './ico-generator.js'
import GenerateICNS from './icns-generator.js'
import GenerateFavicon from './favicon-generator.js'
import Util from './util.js'
import Logger from './logger.js'

/**
 * Generate an icon = require(the image file informations.
 * @param {ImageInfo[]} images Image file informations.
 * @param {String} dest Destination directory path.
 * @param {Object} options Options.
 * @param {Logger} logger Logger.
 * @param {Function} cb Callback function.
 */
const generateIcon = (images, dest, options, logger, cb) => {
  if (!(images && 0 < images.length)) {
    cb(new Error('Targets is empty.'))
    return
  }

  const dir = Path.resolve(dest)
  MkdirP.sync(dir)

  // Select output mode
  const tasks = []
  if (options.icns) {
    tasks.push(GenerateICNS(images, dir, options.icns, logger))
  }

  if (options.ico) {
    tasks.push(GenerateICO(images, dir, options.ico, logger))
  }

  if (options.favicon) {
    tasks.push(GenerateFavicon(images, dir, options.favicon, logger))
  }

  Promise.all(tasks)
    .then((results) => {
      cb(null, Util.flattenValues(results))
    })
    .catch((err) => {
      cb(err)
    })
}

/**
 * Generate an icon from PNG file.
 * @param {String} src Path of the PNG files direcgtory.
 * @param {String} dir Path of the output files directory.
 * @param {Object} options Options.
 * @param {Logger} logger  Logger.
 * @return {Promise} Promise object.
 */
const generateIconFromPNG = (src, dir, options, logger) => {
  return new Promise((resolve, reject) => {
    const pngDirPath = Path.resolve(src)
    const destDirPath = Path.resolve(dir)
    logger.log('Icon generator from PNG:')
    logger.log('  src: ' + pngDirPath)
    logger.log('  dir: ' + destDirPath)

    const images = GetRequiredPNGImageSizes(options)
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

    generateIcon(images, dir, options, logger, (err, results) => {
      return err ? reject(err) : resolve(results)
    })
  })
}

/**
 * Generate an icon from SVG file.
 * @param {String} src Path of the SVG file.
 * @param {String} dir Path of the output files directory.
 * @param {CLIOption} options Options from command line.
 * @param {Logger} logger  Logger.
 * @return {Promise} Promise object.
 */
const generateIconFromSVG = (src, dir, options, logger) => {
  return new Promise((resolve, reject) => {
    const svgFilePath = Path.resolve(src)
    const destDirPath = Path.resolve(dir)
    logger.log('Icon generator from SVG:')
    logger.log('  src: ' + svgFilePath)
    logger.log('  dir: ' + destDirPath)

    const workDir = Util.createWorkDir()
    if (!workDir) {
      reject(new Error('Failed to create the working directory.'))
      return
    }

    GeneratePNG(
      svgFilePath,
      workDir,
      options,
      (err, images) => {
        if (err) {
          Del.sync([workDir], { force: true })
          reject(err)
          return
        }

        generateIcon(images, destDirPath, options, logger, (err2, results) => {
          Del.sync([workDir], { force: true })
          return err2 ? reject(err2) : resolve(results)
        })
      },
      logger
    )
  })
}

/**
 * Check an option properties.
 * @param {Object} options Output destination the path of directory.
 * @returns {Object} Checked options.
 */
const checkOptions = (options) => {
  let opt = options
  if (opt) {
    if (!opt.ico && !opt.icns && !opt.favicon) {
      opt.icns = {}
      opt.ico = {}
      opt.favicon = {}
    }
  } else {
    opt = {
      icns: {},
      ico: {},
      favicon: {}
    }
  }

  return opt
}

/**
 * Generate an icon from SVG or PNG file.
 * @param {String} src Path of the SVG file.
 * @param {String} dest Path of the output files directory.
 * @param {Object} options Options.
 * @return {Promise} Promise object.
 */
const GenerateIcon = (src, dest, options = {}) => {
  if (!Fs.existsSync(src)) {
    return Promise.reject(new Error('Input file or directory is not found.'))
  }

  if (!Fs.existsSync(dest)) {
    return Promise.reject(new Error('Output directory is not found.'))
  }

  const logger = new Logger(options && options.report)
  const opt = checkOptions(options)

  if (Fs.statSync(src).isDirectory()) {
    return generateIconFromPNG(src, dest, opt, logger)
  } else {
    return generateIconFromSVG(src, dest, opt, logger)
  }
}

export default GenerateIcon
