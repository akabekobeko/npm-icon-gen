import { test, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import Logger from './logger'
import generateICO, { REQUIRED_IMAGE_SIZES } from './ico'

test('generateICO', () => {
  const targets = REQUIRED_IMAGE_SIZES.map((size) => {
    const filePath = path.join('./examples/data', size + '.png')
    return { size, filePath }
  })

  generateICO(targets, './examples/data', new Logger(), {}).then((result) => {
    // output file size must be at least larger than input file size
    expect(
      fs.statSync(result).size >
        fs.statSync(targets[targets.length - 1].filePath).size
    ).toBe(true)
    fs.unlinkSync(result)
  })
})
