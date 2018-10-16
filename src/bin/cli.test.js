import assert from 'assert'
import Path from 'path'
import Rewire from 'rewire'

/** @test {CLI} */
describe('CLI', () => {
  const Module = Rewire('./cli.js')

  /** @test {parseArgv} */
  describe('parseArgv', () => {
    const parseArgv = Module.__get__('parseArgv')

    it('parse: Empty arguments', () => {
      const options = parseArgv([])
      assert(options.help)
    })

    it('parse: -h --help', () => {
      let options = parseArgv(['-h'])
      assert(options.help)

      options = parseArgv(['--help'])
      assert(options.help)
    })

    it('parse: -v --version', () => {
      let options = parseArgv(['-v'])
      assert(options.version)

      options = parseArgv(['--version'])
      assert(options.version)
    })

    it('parse: -m --modes', () => {
      let options = parseArgv(['-m', 'XXX'])
      assert(options.modes.length === 3)

      options = parseArgv(['--modes', 'XXX'])
      assert(options.modes.length === 3)

      options = parseArgv(['-m', 'ico'])
      assert(options.modes.length === 1)

      options = parseArgv(['-m', 'ico,icns,favicon'])
      assert(options.modes.length === 3)

      options = parseArgv(['-m', 'ico,XXX,icns'])
      assert(options.modes.length === 2)
    })

    it('parse: -i SVGFILE -o DESTDIR', () => {
      const argv = ['-i', './test/data/sample.svg', '-o', './test']
      const options = parseArgv(argv)

      const actualInputPath = Path.resolve(argv[1])
      assert(options.input === actualInputPath)

      const actualOutputPath = Path.resolve(argv[3])
      assert(options.output === actualOutputPath)

      assert(options.type === 'svg')
      assert(!options.report)
    })

    it('parse: -i PNGDIR -o DESTDIR -t png -r', () => {
      const argv = ['-i', './test/data', '-o', './test', '-t', 'png', '-r']

      const options = parseArgv(argv)

      const actualInputPath = Path.resolve(argv[1])
      assert(options.input === actualInputPath)

      const actualOutputPath = Path.resolve(argv[3])
      assert(options.output === actualOutputPath)

      assert(options.type === 'png')
      assert(options.report)
    })
  })

  /** @test {parseMode} */
  describe('parseMode', () => {
    const parseMode = Module.__get__('parseMode')

    it('Default', () => {
      const modes = parseMode()
      assert.deepStrictEqual(modes, ['ico', 'icns', 'favicon'])
    })

    it('ico, icns, favicon', () => {
      const modes = parseMode('ico,icns,favicon')
      assert(modes.length === 3)
    })

    it('ico', () => {
      const modes = parseMode('ico')
      assert(modes[0] === 'ico')
    })

    it('icns', () => {
      const modes = parseMode('icns')
      assert(modes[0] === 'icns')
    })

    it('favicon', () => {
      const modes = parseMode('favicon')
      assert(modes[0] === 'favicon')
    })
  })

  /** @test {parseNames} */
  describe('parseNames', () => {
    const parseNames = Module.__get__('parseNames')

    it('ico & icns', () => {
      const names = parseNames('ico=foo,icns=bar')
      assert.deepStrictEqual({ ico: 'foo', icns: 'bar' }, names)
    })

    it('ico', () => {
      const names = parseNames('ico=foo')
      assert.deepStrictEqual({ ico: 'foo' }, names)
    })

    it('icns', () => {
      const names = parseNames('icns=bar')
      assert.deepStrictEqual({ icns: 'bar' }, names)
    })

    it('Invalid value', () => {
      const names = parseNames()
      assert.deepStrictEqual({}, names)
    })
  })

  /** @test {parseSizes} */
  describe('parseSizes', () => {
    const parseSizes = Module.__get__('parseSizes')

    it('ico & icns', () => {
      const sizes = parseSizes('ico=[16,24,32],icns=[16,24,64]')
      assert.deepStrictEqual({ ico: [16, 24, 32], icns: [16, 24, 64] }, sizes)
    })

    it('ico', () => {
      const sizes = parseSizes('ico=[16,24,32]')
      assert.deepStrictEqual({ ico: [16, 24, 32] }, sizes)
    })

    it('icns', () => {
      const sizes = parseSizes('icns=[16,24,64]')
      assert.deepStrictEqual({ icns: [16, 24, 64] }, sizes)
    })

    it('Invalid value', () => {
      const sizes = parseSizes()
      assert.deepStrictEqual({}, sizes)
    })
  })
})
