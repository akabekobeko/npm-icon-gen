const assert = require('assert')
const Path = require('path')
const TestUtil = require('../test-util.js')
const Logger = require('../../src/lib/logger.js')
const {FaviconGenerator, Favicon} = require('../../src/lib/favicon-generator.js')

/** @test {FaviconGenerator} */
describe('FaviconGenerator', () => {
  const testDir = Path.resolve('./test')
  const dataDir = Path.join(testDir, 'data')

  /** @test {FaviconGenerator#generate} */
  it('generate', () => {
    const images = Favicon.imageSizes.map((size) => {
      const path = Path.join(dataDir, size + '.png')
      return { size: size, path: path }
    })

    return FaviconGenerator
    .generate(images, testDir, new Logger())
    .then((results) => {
      assert(results)
      TestUtil.deleteFiles(results)
    })
  })
})
