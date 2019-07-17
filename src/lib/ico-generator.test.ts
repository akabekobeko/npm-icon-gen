import assert from 'assert'
import fs from 'fs'
import path from 'path'
import Logger from './logger'
import generateICO, { REQUIRED_IMAGE_SIZES } from './ico-generator'

describe('ICO', () => {
  it('generateICO', () => {
    const targets = REQUIRED_IMAGE_SIZES.map((size) => {
      const filePath = path.join('./examples/data', size + '.png')
      return { size, filePath }
    })

    generateICO(targets, './examples/data', new Logger(), {}).then((result) => {
      assert(result)
      fs.unlinkSync(result)
    })
  })
})
