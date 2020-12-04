import assert from 'assert'
import fs from 'fs'
import path from 'path'
import Logger from './logger'
import generateICO, { REQUIRED_IMAGE_SIZES } from './ico'

describe('ICO', () => {
  it('generateICO', () => {
    const targets = REQUIRED_IMAGE_SIZES.map((size) => {
      const filePath = path.join('./examples/data', size + '.png')
      return { size, filePath }
    })

    generateICO(targets, './examples/data', new Logger(), {}).then((result) => {
      assert(result)
      // output file size must be at least larger than input file size
      assert(fs.statSync(result).size > fs.statSync(targets[targets.length - 1].filePath).size);
      fs.unlinkSync(result)
    })
  })
})
