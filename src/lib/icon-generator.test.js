import assert from 'assert'
import Util from './util.js'
import Logger from './logger.js'
import IconGenerator from './icon-generator.js'
import PNGGenerator from './png-generator.js'

/** @test {IconGenerator} */
describe('IconGenerator', () => {
  /** @test {IconGenerator#fromPNG} */
  it('fromPNG', () => {
    return IconGenerator.fromPNG('./examples/data', './examples/data', {modes: ['ico', 'icns', 'favicon'], names: {ico: 'app', icns: 'app'}, sizes: {}}, new Logger())
      .then((results) => {
        assert(0 < results.length)
        Util.deleteFiles(results)
      })
  })

  describe('_getRequiredImageSizes', () => {
    it('ico, icns, favicon', () => {
      const modes = ['ico', 'icns', 'favicon']
      let actual = IconGenerator._getRequiredImageSizes(modes)
      let expected = PNGGenerator.getRequiredImageSizes(modes)
      assert.deepStrictEqual(actual, expected)
    })

    it('ico', () => {
      const modes = ['ico']
      const actual = IconGenerator._getRequiredImageSizes(modes)
      const expected = PNGGenerator.getRequiredImageSizes(modes)
      assert.deepStrictEqual(actual, expected)
    })

    it('icns', () => {
      const modes = ['icns']
      const actual = IconGenerator._getRequiredImageSizes(modes)
      const expected = PNGGenerator.getRequiredImageSizes(modes)
      assert.deepStrictEqual(actual, expected)
    })

    it('favicon', () => {
      const modes = ['favicon']
      const actual = IconGenerator._getRequiredImageSizes(modes)
      const expected = PNGGenerator.getRequiredImageSizes(modes)
      assert.deepStrictEqual(actual, expected)
    })

    it('ico: sizes', () => {
      const sizes  = [16, 32]
      const actual = IconGenerator._getRequiredImageSizes(['ico'], {ico: sizes})
      assert.deepStrictEqual(actual, sizes)
    })

    it('icns: sizes', () => {
      const sizes  = [64, 128]
      const actual = IconGenerator._getRequiredImageSizes(['icns'], {icns: sizes})
      assert.deepStrictEqual(actual, sizes)
    })
  })
})
