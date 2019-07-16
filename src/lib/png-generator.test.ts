import assert from 'assert'
import del from 'del'
import Logger from './logger'
import generatePNG from './png-generator'
import { createWorkDir } from './util'

describe('generatePNG', () => {
  it('Generate', () => {
    const dir = createWorkDir()
    assert(dir !== null)

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
