import assert from 'assert'
import TestUtil from './test-util.js'
import Logger from './logger.js'
import IconGenerator from './icon-generator.js'
import PNGGenerator from './png-generator.js'
import {ICO} from './ico-generator.js'
import {ICNS} from './icns-generator.js'
import {Favicon} from './favicon-generator.js'

/** @test {IconGenerator} */
describe('IconGenerator', () => {
  /** @test {IconGenerator#fromPNG} */
  it('fromPNG', () => {
    return IconGenerator.fromPNG('./examples/data', './examples/data', {modes: [], names: {ico: 'app', icns: 'app'}}, new Logger())
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
    assert(expected.length === ICO.imageSizes.length)

    expected = IconGenerator.filter(targets, ICNS.imageSizes)
    assert(expected.length === ICNS.imageSizes.length)

    expected = IconGenerator.filter(targets, Favicon.imageSizes)
    assert(expected.length === Favicon.imageSizes.length)

    expected = IconGenerator.filter(targets, Favicon.icoImageSizes)
    assert(expected.length === Favicon.icoImageSizes.length)
  })
})
