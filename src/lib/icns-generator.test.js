import assert from 'assert'
import Fs from 'fs'
import Path from 'path'
import Logger from './logger.js'
import GenerateICNS, { GetRequiredICNSImageSizes } from './icns-generator.js'
import Rewire from 'rewire'

/** @test {ICNSGenerator} */
describe('ICNSGenerator', () => {
  const Module = Rewire('./icns-generator.js')

  /** @test {GenerateICNS} */
  it('generate', () => {
    const images = GetRequiredICNSImageSizes().map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return { size: size, path: path }
    })

    return GenerateICNS(images, './examples/data', { names: { icns: 'sample' } }, new Logger()).then((result) => {
      assert(result)
      Fs.unlinkSync(result)
    })
  })

  /** @test {createFileHeader} */
  it('createFileHeader', () => {
    const createFileHeader = Module.__get__('createFileHeader')
    const header = createFileHeader(401)

    // In ASCII "icns"
    assert(header.readUInt8(0) === 0x69)
    assert(header.readUInt8(1) === 0x63)
    assert(header.readUInt8(2) === 0x6e)
    assert(header.readUInt8(3) === 0x73)

    // File size
    assert(header.readUInt32BE(4) === 401)
  })

  /** @test {createIconHeader} */
  it('createIconHeader', () => {
    const createIconHeader = Module.__get__('createIconHeader')
    const header = createIconHeader(`ic07`, 713)

    // In ASCII "ic07"
    assert(header.readUInt8(0) === 0x69)
    assert(header.readUInt8(1) === 0x63)
    assert(header.readUInt8(2) === 0x30)
    assert(header.readUInt8(3) === 0x37)

    // Image size (specified size + header size)
    const size = 713 + 8
    assert(header.readUInt32BE(4) === size)
  })

  /*
  it('DebugUnpackIconBlocks', () => {
    const DebugUnpackIconBlocks = Module.__get__('DebugUnpackIconBlocks')
    return DebugUnpackIconBlocks('./examples/data/app.icns', './examples/data')
      .then(() => {
        assert(true)
      })
      .catch((err) => {
        assert(!err)
      })
  })
  */
})
