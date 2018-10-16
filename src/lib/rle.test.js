import assert from 'assert'
import { PackBits, PackICNS, UnpackBits } from './rle.js'
import Rewire from 'rewire'

/** @test {RLE} */
describe('RLE', () => {
  const Module = Rewire('./rle.js')

  /** @test {RLE#packBits} */
  describe('packBits', () => {
    it('Normaly', () => {
      // Sample data : https://en.wikipedia.org/wiki/PackBits
      const src = [
        0xaa,
        0xaa,
        0xaa,
        0x80,
        0x00,
        0x2a,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0x80,
        0x00,
        0x2a,
        0x22,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0xaa
      ]
      const expected = [0xfe, 0xaa, 0x02, 0x80, 0x00, 0x2a, 0xfd, 0xaa, 0x03, 0x80, 0x00, 0x2a, 0x22, 0xf7, 0xaa]
      const actual = PackBits(src)
      assert.deepStrictEqual(actual, expected)
    })
  })

  /** @test {PackICNS} */
  describe('PackICNS', () => {
    it('Normaly', () => {
      const src = [0, 0, 0, 249, 250, 128, 100, 101]
      const actual = PackICNS(src)
      const expected = [128, 0, 4, 249, 250, 128, 100, 101]
      assert.deepStrictEqual(actual, expected)
    })
  })

  /** @test {UnpackBits} */
  describe('UnpackBits', () => {
    it('Normaly', () => {
      // Sample data : https://en.wikipedia.org/wiki/PackBits
      const src = [0xfe, 0xaa, 0x02, 0x80, 0x00, 0x2a, 0xfd, 0xaa, 0x03, 0x80, 0x00, 0x2a, 0x22, 0xf7, 0xaa]
      const expected = [
        0xaa,
        0xaa,
        0xaa,
        0x80,
        0x00,
        0x2a,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0x80,
        0x00,
        0x2a,
        0x22,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0xaa,
        0xaa
      ]
      const actual = UnpackBits(src)
      assert.deepStrictEqual(actual, expected)
    })
  })
  /** @test {packBitsLiteralToResult} */
  describe('packBitsLiteralToResult', () => {
    const packBitsLiteralToResult = Module.__get__('packBitsLiteralToResult')

    it('Normaly', () => {
      assert.deepStrictEqual(packBitsLiteralToResult([7, 1, 5, 8]), [3, 7, 1, 5, 8])
    })

    it('Empty', () => {
      assert.deepStrictEqual(packBitsLiteralToResult([]), [])
    })
  })

  /** @test {toUInt8} */
  describe('toUInt8', () => {
    const toUInt8 = Module.__get__('toUInt8')

    it('Normaly', () => {
      assert(toUInt8(-1) === 255)
      assert(toUInt8(71) === 71)
      assert(toUInt8(0xaa) === 0xaa)
    })

    it('Out of range', () => {
      assert(toUInt8(-180) === 76)
      assert(toUInt8(571) === 59)
    })
  })

  /** @test {toInt8} */
  describe('toInt8', () => {
    const toInt8 = Module.__get__('toInt8')
    it('Normaly', () => {
      assert(toInt8(241) === -15)
      assert(toInt8(83) === 83)
    })

    it('Out of range', () => {
      assert(toInt8(-129) === 127)
      assert(toInt8(195) === -61)
      assert(toInt8(571) === 59)
    })
  })
})
