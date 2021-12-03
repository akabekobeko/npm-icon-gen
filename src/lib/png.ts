import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import Logger from './logger'

/** Image file information. */
export type ImageInfo = {
  /** Image size (width/height). */
  size: number
  /** Path of an image file. */
  filePath: string
}

/**
 * Filter by size to the specified image information.
 * @param images Image file information.
 * @param sizes  Required sizes.
 * @return Filtered image information.
 */
export const filterImagesBySizes = (images: ImageInfo[], sizes: number[]) => {
  return images
    .filter((image) => {
      return sizes.some((size) => {
        return image.size === size
      })
    })
    .sort((a, b) => {
      return a.size - b.size
    })
}

/**
 * Generate the PNG file.
 * @param svg SVG data that has been parse by svg2png.
 * @param size The size (width/height) of the image.
 * @param dir Path of the file output directory.
 * @param logger Logger.
 * @return Image generation task.
 */
const generate = async (
  svg: Buffer,
  size: number,
  dir: string,
  logger: Logger
): Promise<ImageInfo> => {
  const dest = path.join(dir, size + '.png')
  logger.log('  Create: ' + dest)

  await sharp(svg)
    .png({ compressionLevel: 9 })
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(dest)

  return { size: size, filePath: dest }
}

/**
 * Generate the PNG files.
 * @param src Path of SVG file.
 * @param dir Output destination The path of directory.
 * @param sizes Required PNG image size.
 * @param logger Logger.
 */
export const generatePNG = async (
  src: string,
  dir: string,
  sizes: number[],
  logger: Logger
): Promise<ImageInfo[]> => {
  logger.log('SVG to PNG:')

  const svg = fs.readFileSync(src)
  const images: ImageInfo[] = []
  for (const size of sizes) {
    images.push(await generate(svg, size, dir, logger))
  }

  return images
}

export default generatePNG
