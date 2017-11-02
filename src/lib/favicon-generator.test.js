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
        assert(results)
        Util.deleteFiles(results)
      })
  })

  it('generateICO', () => {
    const images = [16, 24, 32, 48, 64].map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return {size: size, path: path}
    })

    return FaviconGenerator
      .generateICO(images, './examples/data', new Logger())
      .then((result) => {
        assert(result)
        Fs.unlinkSync(result)
      })
  })
})
