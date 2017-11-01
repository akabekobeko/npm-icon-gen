import assert from 'assert'
import Util from './util.js'
import Logger from './logger.js'
import IconGenerator from './icon-generator.js'

/** @test {IconGenerator} */
describe('IconGenerator', () => {
  /** @test {IconGenerator#fromPNG} */
  it('fromPNG', () => {
    return IconGenerator.fromPNG('./examples/data', './examples/data', {modes: [], names: {ico: 'app', icns: 'app'}, sizes: {}}, new Logger())
      .then((results) => {
        assert(results)
        Util.deleteFiles(results)
      })
  })
})
