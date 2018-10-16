import assert from 'assert'
import Util from './util.js'
import Logger from './logger.js'
import { GetRequiredIconImageSizes } from './icon-generator.js'
import { GetRequiredPNGImageSizes } from './png-generator.js'
import Rewire from 'rewire'

/** @test {IconGenerator} */
describe('IconGenerator', () => {
  const Module = Rewire('./icon-generator.js')

  /** @test {generateIconFromPNG} */
  it('generateIconFromPNG', () => {
    const generateIconFromPNG = Module.__get__('generateIconFromPNG')
    return generateIconFromPNG(
      './examples/data',
      './examples/data',
      { modes: ['ico', 'icns', 'favicon'], names: { ico: 'app', icns: 'app' }, sizes: {} },
      new Logger()
    ).then((results) => {
      assert(0 < results.length)
      Util.deleteFiles(results)
    })
  })

  /** @test {GetRequiredIconImageSizes} */
  describe('GetRequiredIconImageSizes', () => {
    it('ico, icns, favicon', () => {
      const modes = ['ico', 'icns', 'favicon']
      let actual = GetRequiredIconImageSizes({ modes: modes })
      let expected = GetRequiredPNGImageSizes({ modes: modes })
      assert.deepStrictEqual(actual, expected)
    })

    it('ico', () => {
      const modes = ['ico']
      const actual = GetRequiredIconImageSizes({ modes: modes })
      const expected = GetRequiredPNGImageSizes({ modes: modes })
      assert.deepStrictEqual(actual, expected)
    })

    it('icns', () => {
      const modes = ['icns']
      const actual = GetRequiredIconImageSizes({ modes: modes })
      const expected = GetRequiredPNGImageSizes({ modes: modes })
      assert.deepStrictEqual(actual, expected)
    })

    it('favicon', () => {
      const modes = ['favicon']
      const actual = GetRequiredIconImageSizes({ modes: modes })
      const expected = GetRequiredPNGImageSizes({ modes: modes })
      assert.deepStrictEqual(actual, expected)
    })

    it('ico: sizes', () => {
      const sizes = [16, 32]
      const actual = GetRequiredIconImageSizes({ modes: ['ico'], sizes: { ico: sizes } })
      assert.deepStrictEqual(actual, sizes)
    })

    it('icns: sizes', () => {
      const sizes = [64, 128]
      const actual = GetRequiredIconImageSizes({ modes: ['icns'], sizes: { icns: sizes } })
      assert.deepStrictEqual(actual, sizes)
    })
  })
})
