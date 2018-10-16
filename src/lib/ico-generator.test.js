import assert from 'assert'
import Fs from 'fs'
import Path from 'path'
import Logger from './logger.js'
import GenerateICO, { GetRequiredICOImageSizes } from './ico-generator.js'
import Rewire from 'rewire'

/** @test {ICOGenerator} */
describe('ICOGenerator', () => {
  const Module = Rewire('./ico-generator.js')

  // Private constants
  const HEADER_SIZE = 6
  const DIRECTORY_SIZE = 16
  const BITMAPINFOHEADER_SIZE = 40
  const BI_RGB = 0

  /** @test {GenerateICO} */
  it('generate', () => {
    const targets = GetRequiredICOImageSizes().map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return { size: size, path: path, stat: Fs.statSync(path) }
    })

    GenerateICO(targets, './examples/data', { names: { ico: 'sample' } }, new Logger()).then((result) => {
      assert(result)
      Fs.unlinkSync(result)
    })
  })

  /** @test {createFileHeader} */
  it('createFileHeader', () => {
    const createFileHeader = Module.__get__('createFileHeader')
    const count = 7
    const b = createFileHeader(count)

    assert(b.readUInt16LE(0) === 0)
    assert(b.readUInt16LE(2) === 1)
    assert(b.readUInt16LE(4) === count)
  })

  /** @test {createDirectory} */
  it('createDirectory', () => {
    const createDirectory = Module.__get__('createDirectory')
    const png = {
      width: 16,
      height: 16,
      bpp: 4,
      data: {
        length: 1024
      }
    }

    const offset = HEADER_SIZE + DIRECTORY_SIZE
    const b = createDirectory(png, offset)

    assert(b.readUInt8(0) === png.width)
    assert(b.readUInt8(1) === png.height)
    assert(b.readUInt8(2) === 0)
    assert(b.readUInt8(3) === 0)
    assert(b.readUInt16LE(4) === 1)
    assert(b.readUInt16LE(6) === png.bpp * 8)
    assert(b.readUInt32LE(8) === png.data.length + BITMAPINFOHEADER_SIZE)
    assert(b.readUInt32LE(12) === offset)
  })

  /** @test {createBitmapInfoHeader} */
  it('createBitmapInfoHeader', () => {
    const createBitmapInfoHeader = Module.__get__('createBitmapInfoHeader')
    const png = {
      width: 16,
      height: 16,
      bpp: 4,
      data: {
        length: 1024
      }
    }

    const b = createBitmapInfoHeader(png, BI_RGB)
    assert(b.readUInt32LE(0) === BITMAPINFOHEADER_SIZE)
    assert(b.readInt32LE(4) === png.width)
    assert(b.readInt32LE(8) === png.height * 2)
    assert(b.readUInt16LE(12) === 1)
    assert(b.readUInt16LE(14) === png.bpp * 8)
    assert(b.readUInt32LE(16) === BI_RGB)
    assert(b.readUInt32LE(20) === png.data.length)
    assert(b.readInt32LE(24) === 0)
    assert(b.readInt32LE(28) === 0)
    assert(b.readUInt32LE(32) === 0)
    assert(b.readUInt32LE(36) === 0)
  })
})
