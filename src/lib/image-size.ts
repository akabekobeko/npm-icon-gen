import { REQUIRED_IMAGE_SIZES as REQUIRED_FAV_SIZES } from './favicon'
import { REQUIRED_IMAGE_SIZES as REQUIRED_ICNS_SIZES } from './icns'
import { REQUIRED_IMAGE_SIZES as REQUIRED_ICO_SIZES } from './ico'
import { ICONOptions } from './index.js'
import { ImageInfo } from './png'

/**
 * Filter the sizes.
 * @param sizes Original sizes.
 * @param filterSizes Filter sizes.
 * @return ilterd sizes.
 */
export const filterSizes = (
  sizes: number[] = [],
  filterSizes: number[] = []
) => {
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
 * Filter by size to the specified image informations.
 * @param images Image file informations.
 * @param sizes  Required sizes.
 * @return Filtered image informations.
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
 * Gets the size of the images needed to create an icon.
 * @param options Options from command line.
 * @return The sizes of the image.
 */
export const getRequiredPNGImageSizes = (options: ICONOptions) => {
  let sizes: number[] = []
  if (options.icns) {
    sizes = sizes.concat(filterSizes(REQUIRED_ICNS_SIZES, options.icns.sizes))
  }

  if (options.ico) {
    sizes = sizes.concat(filterSizes(REQUIRED_ICO_SIZES, options.ico.sizes))
  }

  if (options.favicon) {
    if (options.favicon.pngSizes) {
      // Favicon's PNG generates the specified size as it is
      sizes = sizes.concat(options.favicon.pngSizes)
    } else {
      sizes = sizes.concat(REQUIRED_FAV_SIZES)
    }
  }

  // 'all' mode
  if (sizes.length === 0) {
    sizes = REQUIRED_FAV_SIZES
    sizes = sizes.concat(REQUIRED_ICNS_SIZES)
    sizes = sizes.concat(REQUIRED_ICO_SIZES)
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

export default getRequiredPNGImageSizes
