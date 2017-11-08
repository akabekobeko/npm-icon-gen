import assert from 'assert'
import Fs from 'fs'
import Path from 'path'
import Util from './util.js'
import Logger from '../lib/logger.js'
import FaviconGenerator from './favicon-generator.js'

/** @test {FaviconGenerator} */
describe('FaviconGenerator', () => {
  /** @test {FaviconGenerator#generate} */
  it('generate', () => {
    const images = FaviconGenerator.getRequiredImageSizes().map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return {size: size, path: path}
    })

    return FaviconGenerator
      .generate(images, './examples/data', new Logger())
      .then((results) => {
        assert(results.length === 11)
        Util.deleteFiles(results)
      })
  })

  /** @test {FaviconGenerator#_generateICO} */
  it('_generateICO', () => {
    const images = [16, 24, 32, 48, 64].map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return {size: size, path: path}
    })

    return FaviconGenerator
      ._generateICO(images, './examples/data', new Logger())
      .then((result) => {
        assert(Path.basename(result) === 'favicon.ico')
        Fs.unlinkSync(result)
      })
  })

  /** @test {FaviconGenerator#_generatePNG} */
  it('_generatePNG', () => {
    const images = FaviconGenerator.getRequiredImageSizes().map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return {size: size, path: path}
    })

    return FaviconGenerator
      ._generatePNG(images, './examples/data', new Logger())
      .then((results) => {
        assert(results.length === 10)
        Util.deleteFiles(results)
      })
  })
})
