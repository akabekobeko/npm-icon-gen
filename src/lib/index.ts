import fs from 'fs'
import path from 'path'
import Del from 'del'
import mkdirP from 'mkdirp'
import generatePNG, { ImageInfo } from './png-generator'
import generateICO from './ico-generator'
import generateICNS from './icns-generator'
import generateFavicon from './favicon-generator'
import { createWorkDir } from './util'
import Logger from './logger'
import getRequiredPNGImageSizes from './get-required-image-sizes'

/** Options of icon generation. */
export type ICONOptions = {
  /** Output setting of ICO file. */
  ico?: {
    /** Name of an output file. */
    name?: string
    /** Structure of an image sizes. */
    sizes?: number[]
  }

  /** Output setting of ICNS file. */
  icns?: {
    /** Name of an output file. */
    name?: string
    /** Structure of an image sizes. */
    sizes?: number[]
  }

  /** Output setting of Favicon file (PNG and ICO). */
  favicon?: {
    /** Prefix of an output PNG files. Start with the alphabet, can use `-` and `_`. This option is for PNG. The name of the ICO file is always `favicon.ico`. */
    name?: string
    /** Size structure of PNG files to output. */
    pngSizes?: number[]
    /** Structure of an image sizes for ICO. */
    icoSizes?: number[]
  }

  report: boolean
}

/**
 * Generate an icon = require(the image file informations.
 * @param images Image file informations.
 * @param dest Destination directory path.
 * @param options Options.
 * @param logger Logger.
 * @return Path of output files.
 */
const generate = async (
  images: ImageInfo[],
  dest: string,
  options: ICONOptions,
  logger: Logger
): Promise<string[]> => {
  if (!(images && 0 < images.length)) {
    throw new Error('Targets is empty.')
  }

  const dir = path.resolve(dest)
  mkdirP.sync(dir)

  const results: string[] = []
  if (options.icns) {
    results.push(await generateICNS(images, dir, logger, options.icns))
  }

  if (options.ico) {
    results.push(await generateICO(images, dir, logger, options.ico))
  }

  if (options.favicon) {
    const files = await generateFavicon(images, dir, logger, options.favicon)
    Array.apply(results, files)
  }

  return results
}

/**
 * Generate an icon from PNG file.
 * @param src Path of the PNG files direcgtory.
 * @param dir Path of the output files directory.
 * @param options Options.
 * @param logger  Logger.
 * @return Path of output files.
 */
const generateIconFromPNG = (
  src: string,
  dir: string,
  options: ICONOptions,
  logger: Logger
): Promise<string[]> => {
  const pngDirPath = path.resolve(src)
  const destDirPath = path.resolve(dir)
  logger.log('Icon generator from PNG:')
  logger.log('  src: ' + pngDirPath)
  logger.log('  dir: ' + destDirPath)

  const images = getRequiredPNGImageSizes(options)
    .map((size) => {
      return path.join(pngDirPath, size + '.png')
    })
    .map((filePath) => {
      const size = Number(path.basename(filePath, '.png'))
      return { filePath, size }
    })

  let notExistsFile = null
  images.some((image) => {
    const stat = fs.statSync(image.filePath)
    if (!(stat && stat.isFile())) {
      notExistsFile = path.basename(image.filePath)
      return true
    }

    return false
  })

  if (notExistsFile) {
    throw new Error('"' + notExistsFile + '" does not exist.')
  }

  return generate(images, dir, options, logger)
}

/**
 * Generate an icon from SVG file.
 * @param src Path of the SVG file.
 * @param dir Path of the output files directory.
 * @param options Options from command line.
 * @param logger  Logger.
 * @return Path of generated files.
 */
const generateIconFromSVG = async (
  src: string,
  dir: string,
  options: ICONOptions,
  logger: Logger
): Promise<string[]> => {
  const svgFilePath = path.resolve(src)
  const destDirPath = path.resolve(dir)
  logger.log('Icon generator from SVG:')
  logger.log('  src: ' + svgFilePath)
  logger.log('  dir: ' + destDirPath)

  const workDir = createWorkDir()
  if (!workDir) {
    throw new Error('Failed to create the working directory.')
  }

  try {
    const images = await generatePNG(
      svgFilePath,
      workDir,
      getRequiredPNGImageSizes(options),
      logger
    )
    const results = await generate(images, destDirPath, options, logger)
    Del.sync([workDir], { force: true })
    return results
  } catch (err) {
    Del.sync([workDir], { force: true })
    throw err
  }
}

/**
 * Generate an icon from SVG or PNG file.
 * @param src Path of the SVG file.
 * @param dest Path of the output files directory.
 * @param options Options.
 * @return Path of generated files.
 */
const generateIcon = async (
  src: string,
  dest: string,
  options: ICONOptions = { ico: {}, icns: {}, favicon: {}, report: false }
): Promise<string[]> => {
  if (!fs.existsSync(src)) {
    throw new Error('Input file or directory is not found.')
  }

  if (!fs.existsSync(dest)) {
    throw new Error('Output directory is not found.')
  }

  const logger = new Logger(options.report)
  if (fs.statSync(src).isDirectory()) {
    return generateIconFromPNG(src, dest, options, logger)
  } else {
    return generateIconFromSVG(src, dest, options, logger)
  }
}

export default generateIcon
