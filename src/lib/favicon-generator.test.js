import assert from 'assert'
import Path from 'path'
import TestUtil from './test-util.js'
import Logger from '../lib/logger.js'
import FaviconGenerator, {Favicon} from './favicon-generator.js'

/** @test {FaviconGenerator} */
describe('FaviconGenerator', () => {
  /** @test {FaviconGenerator#generate} */
  it('generate', () => {
    const images = Favicon.imageSizes.map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return {size: size, path: path}
    })

    return FaviconGenerator
    .generate(images, './examples/data', new Logger())
    .then((results) => {
      assert(results)
      TestUtil.deleteFiles(results)
    })
  })
})
