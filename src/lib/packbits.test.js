import assert from 'assert'
import PackBits from './packbits.js'

/** @test {PackBits} */
describe('PackBits', () => {
  /** @test {PackBits#pack} */
  describe('pack', () => {
    it('Normaly', () => {
      const src      = [0xAA, 0xAA, 0xAA, 0x80, 0x00, 0x2A, 0xAA, 0xAA, 0xAA, 0xAA, 0x80, 0x00, 0x2A, 0x22, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA]
      const expected = [0xFE, 0xAA, 0x02, 0x80, 0x00, 0x2A, 0xFD, 0xAA, 0x03, 0x80, 0x00, 0x2A, 0x22, 0xF7, 0xAA]
      const actual   = PackBits.pack(src)
      assert.deepEqual(actual, expected)
    })
  })

  /** @test {PackBits#unpack} */
  describe('unpack', () => {
    it('Normaly', () => {
      const src = [0xFE, 0xAA, 0x02, 0x80, 0x00, 0x2A, 0xFD, 0xAA, 0x03, 0x80, 0x00, 0x2A, 0x22, 0xF7, 0xAA]
      const expected = [0xAA, 0xAA, 0xAA, 0x80, 0x00, 0x2A, 0xAA, 0xAA, 0xAA, 0xAA, 0x80, 0x00, 0x2A, 0x22, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA]
      const actual   = PackBits.unpack(src)
      assert.deepEqual(actual, expected)
    })
  })

  /** @test {PackBits#_literalToResult} */
  describe('_literalToResult', () => {
    it('Normaly', () => {
      assert.deepEqual(PackBits._literalToResult([7, 1, 5, 8]), [3, 7, 1, 5, 8])
    })

    it('Empty', () => {
      assert.deepEqual(PackBits._literalToResult([]), [])
    })
  })

  /** @test {PackBits#_toUInt8} */
  describe('_toUInt8', () => {
    it('Normaly', () => {
      assert(PackBits._toUInt8(-1) === 255)
      assert(PackBits._toUInt8(71) === 71)
      assert(PackBits._toUInt8(0xAA) === 0xAA)
    })

    it('Out of range', () => {
      assert(PackBits._toUInt8(-180) === 76)
      assert(PackBits._toUInt8(571) === 59)
    })
  })

  /** @test {PackBits#_toInt8} */
  describe('_toInt8', () => {
    it('Normaly', () => {
      assert(PackBits._toInt8(241) === -15)
      assert(PackBits._toInt8(83) === 83)
    })

    it('Out of range', () => {
      assert(PackBits._toInt8(-129) === 127)
      assert(PackBits._toInt8(195) === -61)
      assert(PackBits._toInt8(571) === 59)
    })
  })
})
