import assert from 'assert'
import Fs from 'fs'
import Del from 'del'
import Logger from './logger.js'
import PNGGenerator from './png-generator.js'
import {Favicon} from './favicon-generator'
import {ICO} from './ico-generator.js'
import {ICNS} from './icns-generator.js'
import {CLI} from '../bin/cli-util.js'

/** @test {PNGGenerator} */
describe('PNGGenerator', () => {
  /** @test {PNGGenerator#generetePNG} */
  it('generetePNG', () => {
    const svg = Fs.readFileSync('./examples/data/sample.svg')
    assert(svg)

    const dir = PNGGenerator.createWorkDir()
    assert(dir)

    const size = 16
    PNGGenerator
    .generetePNG(svg, size, dir, new Logger())
    .then((result) => {
      assert(result.size === size)
      Del.sync([dir], {force: true})
    })
    .catch((err) => {
      console.error(err)
      assert()
      Del.sync([dir], {force: true})
    })
  })

  /** @test {PNGGenerator#createWorkDir} */
  it('createWorkDir', () => {
    const dir = PNGGenerator.createWorkDir()
    assert(dir)

    Del.sync([dir], {force: true})
  })

  /** @test {PNGGenerator#getRequiredImageSizes} */
  it('getRequiredImageSizes', () => {
    let   expected = PNGGenerator.getRequiredImageSizes()
    const actual   = [16, 24, 32, 48, 57, 64, 72, 96, 120, 128, 144, 152, 195, 228, 256, 512, 1024]
    assert.deepEqual(expected, actual)

    expected = PNGGenerator.getRequiredImageSizes([CLI.modes.ico])
    assert.deepEqual(expected, ICO.imageSizes)

    expected = PNGGenerator.getRequiredImageSizes([CLI.modes.icns])
    assert.deepEqual(expected, ICNS.imageSizes)

    expected = PNGGenerator.getRequiredImageSizes([CLI.modes.favicon])
    assert.deepEqual(expected, Favicon.imageSizes)
  })
})
