import assert from 'assert'
import os from 'os'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import del from 'del'
import Logger from './logger'
import generatePNG, { filterImagesBySizes } from './png'
import { REQUIRED_IMAGE_SIZES as FAV_SIZES } from './favicon'
import { REQUIRED_IMAGE_SIZES as ICNS_SIZES } from './icns'
import { REQUIRED_IMAGE_SIZES as ICO_SIZES } from './ico'

describe('PNG', () => {
  describe('generatePNG', () => {
    it('Generate', () => {
      const dir = path.join(os.tmpdir(), uuidv4())
      fs.mkdirSync(dir)

      return generatePNG('./examples/data/sample.svg', dir, [16], new Logger())
        .then((results) => {
          assert(results[0].size === 16)
          del.deleteSync([dir], { force: true })
        })
        .catch((err) => {
          console.error(err)
          del.deleteSync([dir], { force: true })
        })
    })
  })

  describe('filterImagesBySizes', () => {
    const targets = ICO_SIZES.concat(ICNS_SIZES)
      .concat(FAV_SIZES)
      .filter((value, index, array) => array.indexOf(value) === index)
      .sort((a, b) => a - b)
      .map((size) => ({ size, filePath: '' }))

    it('ICO', () => {
      const sizes = filterImagesBySizes(targets, ICO_SIZES)
      assert.strictEqual(sizes.length, ICO_SIZES.length)
    })

    it('ICNS', () => {
      const sizes = filterImagesBySizes(targets, ICNS_SIZES)
      assert.strictEqual(sizes.length, ICNS_SIZES.length)
    })
    it('Favicon', () => {
      const sizes = filterImagesBySizes(targets, FAV_SIZES)
      assert.strictEqual(sizes.length, FAV_SIZES.length)
    })
  })
})
