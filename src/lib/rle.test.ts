import assert from 'assert'
import { packBits, packICNS, unpackBits, packBitsLiteralToResult } from './rle'

describe('RLE', () => {
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
      const expected = [
        0xfe,
        0xaa,
        0x02,
        0x80,
        0x00,
        0x2a,
        0xfd,
        0xaa,
        0x03,
        0x80,
        0x00,
        0x2a,
        0x22,
        0xf7,
        0xaa
      ]
      const actual = packBits(src)
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('packICNS', () => {
    it('Normaly', () => {
      const src = [0, 0, 0, 249, 250, 128, 100, 101]
      const actual = packICNS(src)
      const expected = [128, 0, 4, 249, 250, 128, 100, 101]
      assert.deepStrictEqual(actual, expected)
    })
  })

  describe('unpackBits', () => {
    it('Normaly', () => {
      // Sample data : https://en.wikipedia.org/wiki/PackBits
      const src = [
        0xfe,
        0xaa,
        0x02,
        0x80,
        0x00,
        0x2a,
        0xfd,
        0xaa,
        0x03,
        0x80,
        0x00,
        0x2a,
        0x22,
        0xf7,
        0xaa
      ]
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
      const actual = unpackBits(src)
      assert.deepStrictEqual(actual, expected)
    })
  })
  /** @test {packBitsLiteralToResult} */
  describe('_packBitsLiteralToResult', () => {
    it('Normaly', () => {
      assert.deepStrictEqual(packBitsLiteralToResult([7, 1, 5, 8]), [
        3,
        7,
        1,
        5,
        8
      ])
    })

    it('Empty', () => {
      assert.deepStrictEqual(packBitsLiteralToResult([]), [])
    })
  })
})
