import { test, expect } from 'vitest'
import { parseArgv } from './cli'

test('--input', () => {
  const argv = ['', '', '--input', 'sample.svg']
  const options = parseArgv(argv)
  expect(options.input).toBe('sample.svg')
})

test('-i', () => {
  const argv = ['', '', '-i', 'sample.svg']
  const options = parseArgv(argv)
  expect(options.input).toBe('sample.svg')
})

test('--output', () => {
  const argv = ['', '', '--output', './']
  const options = parseArgv(argv)
  expect(options.output).toBe('./')
})

test('-o', () => {
  const argv = ['', '', '-o', './']
  const options = parseArgv(argv)
  expect(options.output).toBe('./')
})

test('parseArgv: icon', () => {
  const argv = ['', '', '-i', 'sample.svg']
  const options = parseArgv(argv)
  expect(options.icon).toStrictEqual({
    report: false,
    icns: {},
    ico: {},
    favicon: {}
  })
})

test('--ico', () => {
  const argv = ['', '', '--ico']
  const options = parseArgv(argv)
  expect(options.icon).toStrictEqual({
    report: false,
    ico: {}
  })
})

test('--ico-name', () => {
  const argv = ['', '', '--ico', '--ico-name', 'sample']
  const options = parseArgv(argv)
  expect(options.icon).toStrictEqual({
    report: false,
    ico: { name: 'sample' }
  })
})

test('--ico-sizes', () => {
  const argv = ['', '', '--ico', '--ico-sizes', '24,32']
  const options = parseArgv(argv)
  expect(options.icon).toStrictEqual({
    report: false,
    ico: { sizes: [24, 32] }
  })
})

test('--icns', () => {
  const argv = ['', '', '--icns']
  const options = parseArgv(argv)
  expect(options.icon).toStrictEqual({
    report: false,
    icns: {}
  })
})

test('--icns-name', () => {
  const argv = ['', '', '--icns', '--icns-name', 'sample']
  const options = parseArgv(argv)
  expect(options.icon).toStrictEqual({
    report: false,
    icns: { name: 'sample' }
  })
})

test('--icns-sizes', () => {
  const argv = ['', '', '--icns', '--icns-sizes', '24,32']
  const options = parseArgv(argv)
  expect(options.icon).toStrictEqual({
    report: false,
    icns: { sizes: [24, 32] }
  })
})

test('--favicon', () => {
  const argv = ['', '', '--favicon']
  const options = parseArgv(argv)
  expect(options.icon).toStrictEqual({
    report: false,
    favicon: {}
  })
})

test('--favicon-name', () => {
  const argv = ['', '', '--favicon', '--favicon-name', 'sample']
  const options = parseArgv(argv)
  expect(options.icon).toStrictEqual({
    report: false,
    favicon: { name: 'sample' }
  })
})

test('--favicon-png-sizes', () => {
  const argv = ['', '', '--favicon', '--favicon-png-sizes', '24,32']
  const options = parseArgv(argv)
  expect(options.icon).toStrictEqual({
    report: false,
    favicon: { pngSizes: [24, 32] }
  })
})

test('--favicon-ico-sizes', () => {
  const argv = ['', '', '--favicon', '--favicon-ico-sizes', '24,32']
  const options = parseArgv(argv)
  expect(options.icon).toStrictEqual({
    report: false,
    favicon: { icoSizes: [24, 32] }
  })
})
