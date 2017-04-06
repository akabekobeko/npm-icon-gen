const assert = require('assert')
const Fs = require('fs')
const Path = require('path')
const Del = require('del')
const Logger = require('../../src/lib/logger.js')
const PNGGenerator = require('../../src/lib/png-generator.js')
const {Favicon} = require('../../src/lib/favicon-generator')
const {ICO} = require('../../src/lib/ico-generator.js')
const {ICNS} = require('../../src/lib/icns-generator.js')
const {CLI} = require('../../src/bin/cli-util.js')

/** @test {PNGGenerator} */
describe('PNGGenerator', () => {
  const rootDir = Path.resolve('./test')
  const dataDir = Path.join(rootDir, 'data')

  /** @test {PNGGenerator#generetePNG} */
  it('generetePNG', () => {
    const svg = Fs.readFileSync(Path.join(dataDir, 'sample.svg'))
    assert(svg)

    const dir = PNGGenerator.createWorkDir()
    assert(dir)

    const size = 16
    PNGGenerator
    .generetePNG(svg, size, dir, new Logger())
    .then((result) => {
      assert(result.size === size)
      Del.sync([dir], {force: true})
    })
    .catch((err) => {
      console.error(err)
      assert()
      Del.sync([dir], {force: true})
    })
  })

  /** @test {PNGGenerator#createWorkDir} */
  it('createWorkDir', () => {
    const dir = PNGGenerator.createWorkDir()
    assert(dir)

    Del.sync([dir], {force: true})
  })

  /** @test {PNGGenerator#getRequiredImageSizes} */
  it('getRequiredImageSizes', () => {
    let   expected = PNGGenerator.getRequiredImageSizes()
    const actual   = [16, 24, 32, 48, 57, 64, 72, 96, 120, 128, 144, 152, 195, 228, 256, 512, 1024]
    assert.deepEqual(expected, actual)

    expected = PNGGenerator.getRequiredImageSizes([ CLI.modes.ico ])
    assert.deepEqual(expected, ICO.imageSizes)

    expected = PNGGenerator.getRequiredImageSizes([ CLI.modes.icns ])
    assert.deepEqual(expected, ICNS.imageSizes)

    expected = PNGGenerator.getRequiredImageSizes([ CLI.modes.favicon ])
    assert.deepEqual(expected, Favicon.imageSizes)
  })
})
