import assert from 'assert'
import Fs from 'fs'
import Path from 'path'
import Util from './util.js'
import Logger from '../lib/logger.js'
import GenerateFavicon, { GetRequiredFavoriteImageSizes } from './favicon-generator.js'
import Rewire from 'rewire'

/** @test {FaviconGenerator} */
describe('FaviconGenerator', () => {
  const Module = Rewire('./favicon-generator.js')

  /** @test {GetRequiredFavoriteImageSizes} */
  it('GetRequiredFavoriteImageSizes', () => {
    const images = GetRequiredFavoriteImageSizes().map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return { size: size, path: path }
    })

    return GenerateFavicon(images, './examples/data', {}, new Logger()).then((results) => {
      assert(results.length === 11)
      Util.deleteFiles(results)
    })
  })

  /** @test {generateICO} */
  it('generateICO', () => {
    const sizes = Module.__get__('REQUIRED_ICO_IMAGE_SIZES')
    const generateICO = Module.__get__('generateICO')
    const images = sizes.map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return { size: size, path: path }
    })

    return generateICO(images, './examples/data', sizes, new Logger()).then((result) => {
      assert(Path.basename(result) === 'favicon.ico')
      Fs.unlinkSync(result)
    })
  })

  /** @test {generatePNG} */
  it('generatePNG', () => {
    const generatePNG = Module.__get__('generatePNG')
    const images = GetRequiredFavoriteImageSizes().map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return { size: size, path: path }
    })

    const sizes = Module.__get__('REQUIRED_PNG_IMAGE_SIZES')
    return generatePNG(images, './examples/data', 'favicon-', sizes, new Logger()).then((results) => {
      assert(results.length === 10)
      Util.deleteFiles(results)
    })
  })
})
