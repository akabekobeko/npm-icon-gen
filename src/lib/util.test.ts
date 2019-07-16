import assert from 'assert'
import { getRequiredPNGImageSizes } from './get-required-image-sizes'
import { REQUIRED_IMAGE_SIZES as REQUIRED_FAV_SIZES } from './favicon-generator'
import { REQUIRED_IMAGE_SIZES as REQUIRED_ICNS_SIZES } from './icns-generator'
import { REQUIRED_IMAGE_SIZES as REQUIRED_ICO_SIZES } from './ico-generator'
import { filterImagesBySizes } from './util'

describe('Util', () => {
  it('filterImagesBySizes', () => {
    const targets = getRequiredPNGImageSizes({ report: false }).map((size) => {
      return { size, filePath: '' }
    })

    let expected = filterImagesBySizes(targets, REQUIRED_ICO_SIZES)
    assert(expected.length === REQUIRED_ICO_SIZES.length)

    expected = filterImagesBySizes(targets, REQUIRED_ICNS_SIZES)
    assert(expected.length === REQUIRED_ICNS_SIZES.length)

    expected = filterImagesBySizes(targets, REQUIRED_FAV_SIZES)
    assert(expected.length === REQUIRED_FAV_SIZES.length)
  })
})
