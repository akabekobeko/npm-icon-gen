import { test, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import Logger from './logger'
import generateICNS, { REQUIRED_IMAGE_SIZES } from './icns'

test('generateICNS', () => {
  const images = REQUIRED_IMAGE_SIZES.map((size) => {
    const filePath = path.join('./examples/data', size + '.png')
    return { size, filePath }
  })

  return generateICNS(images, './examples/data', new Logger(), {
    name: '',
    sizes: []
  }).then((filePath) => {
    // output file size must be at least larger than input file size
    expect(
      fs.statSync(filePath).size >
        fs.statSync(images[images.length - 1].filePath).size
    ).toBe(true)
    fs.unlinkSync(filePath)
  })
})
