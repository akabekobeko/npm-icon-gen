import fs from 'fs'
import path from 'path'
import generateICO from './ico'
import { ImageInfo, filterImagesBySizes } from './png'
import Logger from './logger'

/** Options ot generate ICO file. */
export type FavOptions = {
  /** Prefix of an output PNG files. Start with the alphabet, can use `-` and `_`. This option is for PNG. The name of the ICO file is always `favicon.ico`. */
  name?: string
  /** Size structure of PNG files to output. */
  pngSizes?: number[]
  /** Structure of an image sizes for ICO. */
  icoSizes?: number[]
}

/** Sizes required for the PNG files. */
export const REQUIRED_PNG_SIZES = [32, 57, 72, 96, 120, 128, 144, 152, 195, 228]

/** Sizes required for ICO file. */
export const REQUIRED_ICO_SIZES = [16, 24, 32, 48, 64]

/** Sizes required for Favicon files. */
export const REQUIRED_IMAGE_SIZES = REQUIRED_PNG_SIZES.concat(
  REQUIRED_ICO_SIZES
)
  .filter((a, i, self) => self.indexOf(a) === i)
  .sort((a, b) => a - b)

/** File name of Favicon file. */
const ICO_FILE_NAME = 'favicon'

/** Prefix of PNG file names. */
const PNG_FILE_NAME_PREFIX = 'favicon-'

/**
 * Copy to image.
 * @param image Image information.
 * @param dir Output destination The path of directory.
 * @param prefix Prefix of an output PNG files. Start with the alphabet, can use `-` and `_`. This option is for PNG. The name of the ICO file is always `favicon.ico`.
 * @param logger Logger.
 * @return Path of generated PNG file.
 */
const copyImage = (
  image: ImageInfo,
  dir: string,
  prefix: string,
  logger: Logger
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(image.filePath).on('error', (err) => {
      reject(err)
    })

    const dest = path.join(dir, `${prefix}${image.size}.png`)
    const writer = fs
      .createWriteStream(dest)
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
 * @param images File information for the PNG files generation.
 * @param dir Output destination the path of directory.
 * @param prefix Prefix of an output PNG files. Start with the alphabet, can use `-` and `_`. This option is for PNG. The name of the ICO file is always `favicon.ico`.
 * @param sizes Size structure of PNG files to output.
 * @param logger Logger.
 * @return Path of the generated files.
 */
export const generatePNG = async (
  images: ImageInfo[],
  dir: string,
  prefix: string,
  sizes: number[],
  logger: Logger
): Promise<string[]> => {
  logger.log('Favicon:')

  const targets = filterImagesBySizes(images, sizes)
  const results = []
  for (const image of targets) {
    results.push(await copyImage(image, dir, prefix, logger))
  }

  return results
}

/**
 * Generate a FAVICON image files (ICO and PNG) from the PNG images.
 * @param images File information for the PNG files generation.
 * @param dir Output destination the path of directory.
 * @param logger Logger.
 * @param options Options.
 * @return Path of the generated files.
 */
const generateFavicon = async (
  images: ImageInfo[],
  dir: string,
  logger: Logger,
  options: FavOptions
): Promise<string[]> => {
  const opt = {
    name:
      options.name && options.name !== '' ? options.name : PNG_FILE_NAME_PREFIX,
    pngSizes:
      options.pngSizes && 0 < options.pngSizes.length
        ? options.pngSizes
        : REQUIRED_PNG_SIZES,
    icoSizes:
      options.icoSizes && 0 < options.icoSizes.length
        ? options.icoSizes
        : REQUIRED_ICO_SIZES
  }

  const results = await generatePNG(images, dir, opt.name, opt.pngSizes, logger)
  results.push(
    await generateICO(filterImagesBySizes(images, opt.icoSizes), dir, logger, {
      name: ICO_FILE_NAME,
      sizes: opt.icoSizes
    })
  )
  return results
}

export default generateFavicon
