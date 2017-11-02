import assert from 'assert'
import Del from 'del'
import PNGGenerator from './png-generator.js'
import FaviconGenerator from './favicon-generator.js'
import ICNSGenerator from './icns-generator.js'
import ICOGenerator from './ico-generator.js'
import Util from './util.js'

/** @test {Util} */
describe('Util', () => {
  /** @test {Util#createWorkDir} */
  it('createWorkDir', () => {
    const dir = Util.createWorkDir()
    assert(dir)

    Del.sync([dir], {force: true})
  })

  /** @test {Util#filterImagesBySizes} */
  it('filterImagesBySizes', () => {
    const targets = PNGGenerator.getRequiredImageSizes().map((size) => {
      return {size: size}
    })

    let actual = ICOGenerator.getRequiredImageSizes()
    let expected = Util.filterImagesBySizes(targets, actual)
    assert(expected.length === actual.length)

    actual = ICNSGenerator.getRequiredImageSizes()
    expected = Util.filterImagesBySizes(targets, actual)
    assert(expected.length === actual.length)

    actual = FaviconGenerator.getRequiredImageSizes()
    expected = Util.filterImagesBySizes(targets, actual)
    assert(expected.length === actual.length)
  })

  /** @test {Util#flattenValues} */
  it('flattenValues', () => {
    const values   = ['A', 'B', ['C', 'D']]
    const actual   = ['A', 'B',  'C', 'D']
    const expected = Util.flattenValues(values)

    assert.deepEqual(expected, actual)
  })
})
