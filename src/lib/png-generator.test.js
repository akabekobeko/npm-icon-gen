import assert from 'assert'
import Fs from 'fs'
import Del from 'del'
import Logger from './logger.js'
import { GetRequiredPNGImageSizes } from './png-generator.js'
import { GetRequiredFavoriteImageSizes } from './favicon-generator.js'
import { GetRequiredICNSImageSizes } from './icns-generator.js'
import { GetRequiredICOImageSizes } from './ico-generator.js'
import Util from './util.js'
import Rewire from 'rewire'

/** @test {PNGGenerator} */
describe('PNGGenerator', () => {
  const Module = Rewire('./png-generator.js')

  /** @test {GetRequiredPNGImageSizes} */
  describe('GetRequiredPNGImageSizes', () => {
    it('All', () => {
      let actual = GetRequiredPNGImageSizes()
      let expected = [16, 24, 32, 48, 57, 64, 72, 96, 120, 128, 144, 152, 195, 228, 256, 512, 1024]
      assert.deepStrictEqual(actual, expected)
    })

    it('All with filter', () => {
      let actual = GetRequiredPNGImageSizes({ ico: { sizes: [256] }, icns: { sizes: [512] }, favicon: {} })
      let expected = [16, 24, 32, 48, 57, 64, 72, 96, 120, 128, 144, 152, 195, 228, 256, 512]
      assert.deepStrictEqual(actual, expected)
    })

    it('ICO', () => {
      let actual = GetRequiredPNGImageSizes({ ico: {} })
      let expected = GetRequiredICOImageSizes()
      assert.deepStrictEqual(actual, expected)
    })

    it('ICO with filter', () => {
      let actual = GetRequiredPNGImageSizes({ ico: { sizes: [16, 32, 64] } })
      let expected = [16, 32, 64]
      assert.deepStrictEqual(actual, expected)
    })

    it('ICNS', () => {
      let actual = GetRequiredPNGImageSizes({ icns: {} })
      let expected = GetRequiredICNSImageSizes()
      assert.deepStrictEqual(actual, expected)
    })

    it('ICNS with filter', () => {
      let actual = GetRequiredPNGImageSizes({ icns: { sizes: [16, 1024] } })
      let expected = [16, 1024]
      assert.deepStrictEqual(actual, expected)
    })

    it('Favicon', () => {
      let actual = GetRequiredPNGImageSizes({ favicon: {} })
      let expected = GetRequiredFavoriteImageSizes()
      assert.deepStrictEqual(actual, expected)
    })
  })

  /** @test {generatePNG} */
  it('generatePNG', () => {
    const generatePNG = Module.__get__('generatePNG')
    const svg = Fs.readFileSync('./examples/data/sample.svg')
    assert(svg)

    const dir = Util.createWorkDir()
    assert(dir)

    const size = 16
    return generatePNG(svg, size, dir, new Logger())
      .then((result) => {
        assert(result.size === size)
        Del.sync([dir], { force: true })
      })
      .catch((err) => {
        console.error(err)
        assert()
        Del.sync([dir], { force: true })
      })
  })

  describe('filterSizes', () => {
    const filterSizes = Module.__get__('filterSizes')

    it('Filter', () => {
      const actual = filterSizes(GetRequiredICNSImageSizes(), [16, 18, 32, 64])
      const expected = [16, 32, 64]
      assert.deepStrictEqual(actual, expected)
    })

    it('No filter', () => {
      const actual = filterSizes(GetRequiredICNSImageSizes())
      const expected = [16, 32, 64, 128, 256, 512, 1024]
      assert.deepStrictEqual(actual, expected)
    })
  })
})
