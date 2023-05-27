import { test, expect } from 'vitest'
import fs from 'node:fs'
import Logger from './logger'
import generatePNG, { filterImagesBySizes } from './png'
import { REQUIRED_IMAGE_SIZES as FAV_SIZES } from './favicon'
import { REQUIRED_IMAGE_SIZES as ICNS_SIZES } from './icns'
import { REQUIRED_IMAGE_SIZES as ICO_SIZES } from './ico'

test('generatePNG', () => {
  const dir = fs.mkdtempSync('icon-gen-')

  return generatePNG('./examples/data/sample.svg', dir, [16], new Logger())
    .then((results) => {
      expect(results[0].size).toBe(16)
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      fs.rmSync(dir, { recursive: true, force: true })
    });
})

// Test data
const targets = ICO_SIZES.concat(ICNS_SIZES)
  .concat(FAV_SIZES)
  .filter((value, index, array) => array.indexOf(value) === index)
  .sort((a, b) => a - b)
  .map((size) => ({ size, filePath: '' }))

test('filterImagesBySizes: ICO', () => {
  const sizes = filterImagesBySizes(targets, ICO_SIZES)
  expect(sizes.length).toBe(ICO_SIZES.length)
})

test('filterImagesBySizes: ICNS', () => {
  const sizes = filterImagesBySizes(targets, ICNS_SIZES)
  expect(sizes.length).toBe(ICNS_SIZES.length)
})

test('filterImagesBySizes: Favicon', () => {
  const sizes = filterImagesBySizes(targets, FAV_SIZES)
  expect(sizes.length).toBe(FAV_SIZES.length)
})
