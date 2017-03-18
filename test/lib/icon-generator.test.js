const assert = require('assert')
const Path = require('path')
const TestUtil = require('../test-util.js')
const Logger = require('../../src/lib/logger.js')
const IconGenerator = require('../../src/lib/icon-generator.js')
const PNGGenerator = require('../../src/lib/png-generator.js')
const ICO = require('../../src/lib/constants').ICO
const ICNS = require('../../src/lib/constants.js').ICNS
const Favicon = require('../../src/lib/constants.js').Favicon

/** @test {IconGenerator} */
describe('IconGenerator', () => {
  const testDir = Path.resolve('./test')
  const dataDir = Path.join(testDir, 'data')

  //
  /** @test {IconGenerator#fromSVG} */
  /*
  it('fromSVG', () => {
    return IconGenerator.fromSVG('./test/data/sample.svg', './test', new Logger())
    .then(() => {
      assert(results)
      TestUtil.deleteFiles(results)
    })
  })
  */

  /** @test {IconGenerator#fromPNG} */
  it('fromPNG', () => {
    return IconGenerator.fromPNG(dataDir, './test', {modes: [], names: {ico: 'app', icns: 'app'}}, new Logger())
    .then((results) => {
      assert(results)
      TestUtil.deleteFiles(results)
    })
  })

  it('flattenValues', () => {
    const values   = ['A', 'B', ['C', 'D']]
    const actual   = ['A', 'B',  'C', 'D']
    const expected = IconGenerator.flattenValues(values)

    assert.deepEqual(expected, actual)
  })

  /** @test {IconGenerator#filter} */
  it('filter', () => {
    const targets = PNGGenerator.getRequiredImageSizes().map((size) => {
      return {size: size}
    })

    let expected = IconGenerator.filter(targets, ICO.imageSizes)
    assert(expected.length === 7)

    expected = IconGenerator.filter(targets, ICNS.imageSizes)
    assert(expected.length === 7)

    expected = IconGenerator.filter(targets, Favicon.imageSizes)
    assert(expected.length === 10)

    expected = IconGenerator.filter(targets, Favicon.icoImageSizes)
    assert(expected.length === 5)
  })
})
