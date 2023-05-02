import { packBits, packICNS, unpackBits, packBitsLiteralToResult } from './rle'

it('packBits', () => {
  // Sample data : https://en.wikipedia.org/wiki/PackBits
  const src = [
    0xaa, 0xaa, 0xaa, 0x80, 0x00, 0x2a, 0xaa, 0xaa, 0xaa, 0xaa, 0x80, 0x00,
    0x2a, 0x22, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa
  ]
  const expected = [
    0xfe, 0xaa, 0x02, 0x80, 0x00, 0x2a, 0xfd, 0xaa, 0x03, 0x80, 0x00, 0x2a,
    0x22, 0xf7, 0xaa
  ]
  const actual = packBits(src)
  expect(actual).toStrictEqual(expected)
})

it('packICNS', () => {
  const src = [0, 0, 0, 249, 250, 128, 100, 101]
  const actual = packICNS(src)
  const expected = [128, 0, 4, 249, 250, 128, 100, 101]
  expect(actual).toStrictEqual(expected)
})

it('unpackBits', () => {
  // Sample data : https://en.wikipedia.org/wiki/PackBits
  const src = [
    0xfe, 0xaa, 0x02, 0x80, 0x00, 0x2a, 0xfd, 0xaa, 0x03, 0x80, 0x00, 0x2a,
    0x22, 0xf7, 0xaa
  ]
  const expected = [
    0xaa, 0xaa, 0xaa, 0x80, 0x00, 0x2a, 0xaa, 0xaa, 0xaa, 0xaa, 0x80, 0x00,
    0x2a, 0x22, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa
  ]
  const actual = unpackBits(src)
  expect(actual).toStrictEqual(expected)
})

it('_packBitsLiteralToResult', () => {
  const actual = packBitsLiteralToResult([7, 1, 5, 8])
  const expected = [3, 7, 1, 5, 8]
  expect(actual).toStrictEqual(expected)
})

it('_packBitsLiteralToResult: Empty', () => {
  expect(packBitsLiteralToResult([])).toStrictEqual([])
})
