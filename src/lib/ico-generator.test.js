import assert from 'assert'
import Fs from 'fs'
import Path from 'path'
import Logger from './logger.js'
import ICOGenerator, {ICO} from './ico-generator.js'

/** @test {ICOGenerator} */
describe('ICOGenerator', () => {
  /** @test {ICOGenerator#generate} */
  it('generate', () => {
    const targets = ICO.imageSizes.map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return { size: size, path: path, stat: Fs.statSync(path) }
    })

    ICOGenerator
      .generate(targets, Path.join('./examples/data', 'sample.ico'), new Logger())
      .then((result) => {
        assert(result)
        Fs.unlinkSync(result)
      })
  })

  /** @test {ICOGenerator#_createFileHeader} */
  it('_createFileHeader', () => {
    const count = 7
    const b = ICOGenerator._createFileHeader(count)

    assert(b.readUInt16LE(0) === 0)
    assert(b.readUInt16LE(2) === 1)
    assert(b.readUInt16LE(4) === count)
  })

  /** @test {ICOGenerator#_createDirectory} */
  it('_createDirectory', () => {
    const png = {
      width: 16,
      height: 16,
      bpp: 4,
      data: {
        length: 1024
      }
    }

    const offset = ICO.headerSize + ICO.directorySize
    const b      = ICOGenerator._createDirectory(png, offset)

    assert(b.readUInt8(0) === png.width)
    assert(b.readUInt8(1) === png.height)
    assert(b.readUInt8(2) === 0)
    assert(b.readUInt8(3) === 0)
    assert(b.readUInt16LE(4) === 1)
    assert(b.readUInt16LE(6) === png.bpp * 8)
    assert(b.readUInt32LE(8) === png.data.length + ICO.BitmapInfoHeaderSize)
    assert(b.readUInt32LE(12) === offset)
  })

  /** @test {ICOGenerator#_createBitmapInfoHeader} */
  it('_createBitmapInfoHeader', () => {
    const png = {
      width: 16,
      height: 16,
      bpp: 4,
      data: {
        length: 1024
      }
    }

    const b = ICOGenerator._createBitmapInfoHeader(png, ICO.BI_RGB)
    assert(b.readUInt32LE(0) === ICO.BitmapInfoHeaderSize)
    assert(b.readInt32LE(4) === png.width)
    assert(b.readInt32LE(8) === png.height * 2)
    assert(b.readUInt16LE(12) === 1)
    assert(b.readUInt16LE(14) === png.bpp * 8)
    assert(b.readUInt32LE(16) === ICO.BI_RGB)
    assert(b.readUInt32LE(20) === png.data.length)
    assert(b.readInt32LE(24) === 0)
    assert(b.readInt32LE(28) === 0)
    assert(b.readUInt32LE(32) === 0)
    assert(b.readUInt32LE(36) === 0)
  })
})
