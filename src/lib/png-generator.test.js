import assert from 'assert'
import Fs from 'fs'
import Del from 'del'
import Logger from './logger.js'
import PNGGenerator from './png-generator.js'
import FaviconGenerator from './favicon-generator.js'
import ICNSGenerator from './icns-generator.js'
import ICOGenerator from './ico-generator.js'
import Util from './util.js'
import Rewire from 'rewire'

/** @test {PNGGenerator} */
describe('PNGGenerator', () => {
  const Module = Rewire('./png-generator.js')

  /** @test {PNGGenerator#getRequiredImageSizes} */
  describe('getRequiredImageSizes', () => {
    it('All', () => {
      let actual = PNGGenerator.getRequiredImageSizes()
      let expected = [16, 24, 32, 48, 57, 64, 72, 96, 120, 128, 144, 152, 195, 228, 256, 512, 1024]
      assert.deepStrictEqual(actual, expected)
    })

    it('All with filter', () => {
      let actual = PNGGenerator.getRequiredImageSizes({ sizes: { ico: [256], icns: [512] } })
      let expected = [16, 24, 32, 48, 57, 64, 72, 96, 120, 128, 144, 152, 195, 228, 256, 512]
      assert.deepStrictEqual(actual, expected)
    })

    it('ICO', () => {
      let actual = PNGGenerator.getRequiredImageSizes({ modes: ['ico'] })
      let expected = ICOGenerator.getRequiredImageSizes()
      assert.deepStrictEqual(actual, expected)
    })

    it('ICO with filter', () => {
      let actual = PNGGenerator.getRequiredImageSizes({ modes: ['ico'], sizes: { ico: [16, 32, 64] } })
      let expected = [16, 32, 64]
      assert.deepStrictEqual(actual, expected)
    })

    it('ICNS', () => {
      let actual = PNGGenerator.getRequiredImageSizes({ modes: ['icns'] })
      let expected = ICNSGenerator.getRequiredImageSizes()
      assert.deepStrictEqual(actual, expected)
    })

    it('ICNS with filter', () => {
      let actual = PNGGenerator.getRequiredImageSizes({ modes: ['icns'], sizes: { icns: [16, 1024] } })
      let expected = [16, 1024]
      assert.deepStrictEqual(actual, expected)
    })

    it('Favicon', () => {
      let actual = PNGGenerator.getRequiredImageSizes({ modes: ['favicon'] })
      let expected = FaviconGenerator.getRequiredImageSizes()
      assert.deepStrictEqual(actual, expected)
    })
  })

  /** @test {PNGGenerator#_generetePNG} */
  it('_generetePNG', () => {
    const svg = Fs.readFileSync('./examples/data/sample.svg')
    assert(svg)

    const dir = Util.createWorkDir()
    assert(dir)

    const size = 16
    return PNGGenerator
      ._generatePNG(svg, size, dir, new Logger())
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

  describe('filterSizes', () => {
    const filterSizes = Module.__get__('filterSizes')

    it('Filter', () => {
      const actual = filterSizes(ICNSGenerator.getRequiredImageSizes(), [16, 18, 32, 64])
      const expected = [16, 32, 64]
      assert.deepStrictEqual(actual, expected)
    })

    it('No filter', () => {
      const actual = filterSizes(ICNSGenerator.getRequiredImageSizes())
      const expected = [16, 32, 64, 128, 256, 512, 1024]
      assert.deepStrictEqual(actual, expected)
    })
  })
})
