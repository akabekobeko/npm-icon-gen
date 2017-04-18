import assert from 'assert'
import Fs from 'fs'
import Path from 'path'
import Logger from './logger.js'
import ICNSGenerator, {ICNS} from './icns-generator.js'

/** @test {ICNSGenerator} */
describe('ICNSGenerator', () => {
  /** @test {ICNSGenerator#generate} */
  it('generate', () => {
    const images = ICNS.imageSizes.map((size) => {
      const path = Path.join('./examples/data', size + '.png')
      return { size: size, path: path }
    })

    return ICNSGenerator
    .generate(images, Path.join('./examples/data', 'sample.icns'), new Logger())
    .then((result) => {
      assert(result)
      Fs.unlinkSync(result)
    })
  })

  /** @test {ICNSGenerator#createFileHeader} */
  it('createFileHeader', () => {
    const header = ICNSGenerator.createFileHeader(32)

    // In ASCII "icns"
    assert(header.readUInt8(0) === 0x69)
    assert(header.readUInt8(1) === 0x63)
    assert(header.readUInt8(2) === 0x6e)
    assert(header.readUInt8(3) === 0x73)

    // File size
    assert(header.readUInt32BE(4) === 32)
  })

  /** @test {ICNSGenerator#createIconHeader} */
  it('createIconHeader', () => {
    const header = ICNSGenerator.createIconHeader(ICNS.iconIDs[ 3 ], 128)

    // In ASCII "ic07"
    assert(header.readUInt8(0) === 0x69)
    assert(header.readUInt8(1) === 0x63)
    assert(header.readUInt8(2) === 0x30)
    assert(header.readUInt8(3) === 0x37)

    // Image size
    const size = 128 + ICNS.headerSize
    assert(header.readUInt32BE(4) === size)
  })
})
