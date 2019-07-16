import { REQUIRED_IMAGE_SIZES as REQUIRED_FAV_SIZES } from './favicon-generator'
import { REQUIRED_IMAGE_SIZES as REQUIRED_ICNS_SIZES } from './icns-generator'
import { REQUIRED_IMAGE_SIZES as REQUIRED_ICO_SIZES } from './ico-generator'
import { ICONOptions } from './index.js'

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
