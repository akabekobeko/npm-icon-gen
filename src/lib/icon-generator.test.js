import assert from 'assert'
import Util from './util.js'
import Logger from './logger.js'
import Rewire from 'rewire'

/** @test {IconGenerator} */
describe('IconGenerator', () => {
  const Module = Rewire('./icon-generator.js')

  /** @test {generateIconFromPNG} */
  it('generateIconFromPNG', () => {
    const generateIconFromPNG = Module.__get__('generateIconFromPNG')
    const options = { icns: {}, ico: {}, favicon: {} }
    return generateIconFromPNG('./examples/data', './examples/data', options, new Logger()).then((results) => {
      assert(0 < results.length)
      Util.deleteFiles(results)
    })
  })
})
