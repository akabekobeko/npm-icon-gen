import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import generatePNG, { ImageInfo } from './png'
import generateICO, { REQUIRED_IMAGE_SIZES as ICO_SIZES } from './ico'
import generateICNS, { REQUIRED_IMAGE_SIZES as ICNS_SIZES } from './icns'
import generateFavicon, { REQUIRED_IMAGE_SIZES as FAV_SIZES } from './favicon'
import Logger from './logger'

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

  /** `true` to display the processing status of the tool to `stdout`. */
  report: boolean
}

/**
 * Filter the sizes.
 * @param sizes Original sizes.
 * @param filterSizes Filter sizes.
 * @return filtered sizes.
 */
const filterSizes = (sizes: number[] = [], filterSizes: number[] = []) => {
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
 * Gets the size of the images needed to create an icon.
 * @param options Options from command line.
 * @return The sizes of the image.
 */
const getRequiredPNGImageSizes = (options: ICONOptions) => {
  let sizes: number[] = []
  if (options.icns) {
    sizes = sizes.concat(filterSizes(ICNS_SIZES, options.icns.sizes))
  }

  if (options.ico) {
    sizes = sizes.concat(filterSizes(ICO_SIZES, options.ico.sizes))
  }

  if (options.favicon) {
    if (options.favicon.pngSizes) {
      // Favicon PNG generates the specified size as it is
      sizes = sizes.concat(options.favicon.pngSizes)
    } else {
      sizes = sizes.concat(FAV_SIZES)
    }
  }

  // 'all' mode
  if (sizes.length === 0) {
    sizes = FAV_SIZES.concat(ICNS_SIZES).concat(ICO_SIZES)
  }

  // Always ensure the ascending order
  return sizes
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort((a, b) => a - b)
}

/**
 * Generate an icon files.
 * @param images Image file information.
 * @param dest Destination directory path.
 * @param options Options.
 * @param logger Logger.
 * @return Path of generated files.
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
  fs.mkdirSync(dir, {recursive: true})

  const results: string[] = []
  if (options.icns) {
    results.push(await generateICNS(images, dir, logger, options.icns))
  }

  if (options.ico) {
    results.push(await generateICO(images, dir, logger, options.ico))
  }

  if (options.favicon) {
    const files = await generateFavicon(images, dir, logger, options.favicon)
    for (const file of files) {
      results.push(file)
    }
  }

  return results
}

/**
 * Generate an icon from PNG file.
 * @param src Path of the PNG files directory.
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

  const workDir = fs.mkdtempSync('icon-gen-')

  try {
    const images = await generatePNG(
      svgFilePath,
      workDir,
      getRequiredPNGImageSizes(options),
      logger
    )
    const results = await generate(images, destDirPath, options, logger)
    return results
  } finally {
    fs.rmSync(workDir, {force: true, recursive: true})
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

  // Output all by default if no icon is specified
  if (!(options.ico || options.icns || options.favicon)) {
    options.ico = {}
    options.icns = {}
    options.favicon = {}
  }

  const logger = new Logger(options.report)
  if (fs.statSync(src).isDirectory()) {
    return generateIconFromPNG(src, dest, options, logger)
  } else {
    return generateIconFromSVG(src, dest, options, logger)
  }
}

export default generateIcon
module.exports = generateIcon
