import assert from 'assert'
import os from 'os'
import uuid from 'uuid'
import path from 'path'
import fs from 'fs'
import del from 'del'
import Logger from './logger'
import generatePNG from './png'

describe('PNG', () => {
  describe('generatePNG', () => {
    it('Generate', () => {
      const dir = path.join(os.tmpdir(), uuid.v4())
      fs.mkdirSync(dir)

      return generatePNG('./examples/data/sample.svg', dir, [16], new Logger())
        .then((results) => {
          assert(results[0].size === 16)
          del.sync([dir], { force: true })
        })
        .catch((err) => {
          console.error(err)
          del.sync([dir], { force: true })
        })
    })
  })
})
