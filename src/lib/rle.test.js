import assert from 'assert'
import RLE from './rle.js'

/** @test {RLE} */
describe('RLE', () => {
  /** @test {RLE#packBits} */
  describe('packBits', () => {
    it('Normaly', () => {
      // Sample data : https://en.wikipedia.org/wiki/PackBits
      const src      = [0xAA, 0xAA, 0xAA, 0x80, 0x00, 0x2A, 0xAA, 0xAA, 0xAA, 0xAA, 0x80, 0x00, 0x2A, 0x22, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA]
      const expected = [0xFE, 0xAA, 0x02, 0x80, 0x00, 0x2A, 0xFD, 0xAA, 0x03, 0x80, 0x00, 0x2A, 0x22, 0xF7, 0xAA]
      const actual   = RLE.packBits(src)
      assert.deepStrictEqual(actual, expected)
    })
  })

  /** @test {RLE#packICNS} */
  describe('packICNS', () => {
    it('Normaly', () => {
      const src      = [0, 0, 0, 249, 250, 128, 100, 101]
      const actual   = RLE.packICNS(src)
      const expected = [128, 0, 4, 249, 250, 128, 100, 101]
      assert.deepStrictEqual(actual, expected)
    })
  })

  /** @test {RLE#unpackBits} */
  describe('unpackBits', () => {
    it('Normaly', () => {
      // Sample data : https://en.wikipedia.org/wiki/PackBits
      const src = [0xFE, 0xAA, 0x02, 0x80, 0x00, 0x2A, 0xFD, 0xAA, 0x03, 0x80, 0x00, 0x2A, 0x22, 0xF7, 0xAA]
      const expected = [0xAA, 0xAA, 0xAA, 0x80, 0x00, 0x2A, 0xAA, 0xAA, 0xAA, 0xAA, 0x80, 0x00, 0x2A, 0x22, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA]
      const actual   = RLE.unpackBits(src)
      assert.deepStrictEqual(actual, expected)
    })
  })
  /** @test {RLE#_packBitsLiteralToResult} */
  describe('_packBitsLiteralToResult', () => {
    it('Normaly', () => {
      assert.deepStrictEqual(RLE._packBitsLiteralToResult([7, 1, 5, 8]), [3, 7, 1, 5, 8])
    })

    it('Empty', () => {
      assert.deepStrictEqual(RLE._packBitsLiteralToResult([]), [])
    })
  })

  /** @test {RLE#_toUInt8} */
  describe('_toUInt8', () => {
    it('Normaly', () => {
      assert(RLE._toUInt8(-1) === 255)
      assert(RLE._toUInt8(71) === 71)
      assert(RLE._toUInt8(0xAA) === 0xAA)
    })

    it('Out of range', () => {
      assert(RLE._toUInt8(-180) === 76)
      assert(RLE._toUInt8(571) === 59)
    })
  })

  /** @test {RLE#_toInt8} */
  describe('_toInt8', () => {
    it('Normaly', () => {
      assert(RLE._toInt8(241) === -15)
      assert(RLE._toInt8(83) === 83)
    })

    it('Out of range', () => {
      assert(RLE._toInt8(-129) === 127)
      assert(RLE._toInt8(195) === -61)
      assert(RLE._toInt8(571) === 59)
    })
  })
})
