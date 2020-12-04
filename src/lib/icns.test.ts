import assert from 'assert'
import fs from 'fs'
import path from 'path'
import Logger from './logger'
import generateICNS, { REQUIRED_IMAGE_SIZES } from './icns'

describe('ICNS', () => {
  it('generateICNS', () => {
    const images = REQUIRED_IMAGE_SIZES.map((size) => {
      const filePath = path.join('./examples/data', size + '.png')
      return { size, filePath }
    })

    return generateICNS(images, './examples/data', new Logger(), {
      name: '',
      sizes: []
    }).then((filePath) => {
      assert(filePath)
      // output file size must be at least larger than input file size
      assert(fs.statSync(filePath).size > fs.statSync(images[images.length - 1].filePath).size);
      fs.unlinkSync(filePath)
    })
  })
})
