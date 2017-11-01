import assert from 'assert'
import Del from 'del'
import PNGGenerator from './png-generator.js'
import {Favicon} from './favicon-generator.js'
import {ICO} from './ico-generator.js'
import {ICNS} from './icns-generator.js'
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

    let expected = Util.filterImagesBySizes(targets, ICO.imageSizes)
    assert(expected.length === ICO.imageSizes.length)

    expected = Util.filterImagesBySizes(targets, ICNS.imageSizes)
    assert(expected.length === ICNS.imageSizes.length)

    expected = Util.filterImagesBySizes(targets, Favicon.imageSizes)
    assert(expected.length === Favicon.imageSizes.length)

    expected = Util.filterImagesBySizes(targets, Favicon.icoImageSizes)
    assert(expected.length === Favicon.icoImageSizes.length)
  })

  /** @test {Util#flattenValues} */
  it('flattenValues', () => {
    const values   = ['A', 'B', ['C', 'D']]
    const actual   = ['A', 'B',  'C', 'D']
    const expected = Util.flattenValues(values)

    assert.deepEqual(expected, actual)
  })
})
