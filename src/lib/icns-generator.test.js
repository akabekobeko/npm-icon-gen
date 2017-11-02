import assert from 'assert'
import Fs from 'fs'
import Path from 'path'
import Logger from './logger.js'
import ICNSGenerator from './icns-generator.js'

/** @test {ICNSGenerator} */
describe('ICNSGenerator', () => {
  /** @test {ICNSGenerator#generate} */
  it('generate', () => {
    const images = ICNSGenerator.getRequiredImageSizes().map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return { size: size, path: path }
    })

    return ICNSGenerator
      .generate(images, './examples/data', {names: {icns: 'sample'}}, new Logger())
      .then((result) => {
        assert(result)
        Fs.unlinkSync(result)
      })
  })

  /** @test {ICNSGenerator#_createFileHeader} */
  it('_createFileHeader', () => {
    const header = ICNSGenerator._createFileHeader(32)

    // In ASCII "icns"
    assert(header.readUInt8(0) === 0x69)
    assert(header.readUInt8(1) === 0x63)
    assert(header.readUInt8(2) === 0x6e)
    assert(header.readUInt8(3) === 0x73)

    // File size
    assert(header.readUInt32BE(4) === 32)
  })

  /** @test {ICNSGenerator#_createIconHeader} */
  it('_createIconHeader', () => {
    const header = ICNSGenerator._createIconHeader({id: 'ic07', size: 128}, 713)

    // In ASCII "ic07"
    assert(header.readUInt8(0) === 0x69)
    assert(header.readUInt8(1) === 0x63)
    assert(header.readUInt8(2) === 0x30)
    assert(header.readUInt8(3) === 0x37)

    // Image size (specified size + header size)
    const size = 713 + 8
    assert(header.readUInt32BE(4) === size)
  })
})
