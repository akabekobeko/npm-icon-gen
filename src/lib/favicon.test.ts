import assert from 'assert'
import path from 'path'
import fs from 'fs'
import Logger from './logger'
import generateFavicon, {
  REQUIRED_IMAGE_SIZES,
  REQUIRED_PNG_SIZES,
  generatePNG
} from './favicon'

/**
 * Delete a files.
 * @param paths File paths.
 */
const deleteFiles = (paths: string[]) => {
  paths.forEach((path) => {
    try {
      const stat = fs.statSync(path)
      if (stat && stat.isFile()) {
        fs.unlinkSync(path)
      }
    } catch (err) {
      console.error(err)
    }
  })
}

describe('Favicon', () => {
  it('generateFavicon', () => {
    const images = REQUIRED_IMAGE_SIZES.map((size) => {
      const filePath = path.join('./examples/data', size + '.png')
      return { size, filePath }
    })

    return generateFavicon(images, './examples/data', new Logger(), {
      name: '',
      pngSizes: [],
      icoSizes: []
    }).then((results) => {
      assert(results.length === 11)
      deleteFiles(results)
    })
  })

  it('generatePNG', () => {
    const images = REQUIRED_PNG_SIZES.map((size) => {
      const filePath = path.join('./examples/data', size + '.png')
      return { size, filePath }
    })

    return generatePNG(
      images,
      './examples/data',
      'favicon-',
      REQUIRED_PNG_SIZES,
      new Logger()
    ).then((results) => {
      assert(results.length === 10)
      deleteFiles(results)
    })
  })
})
