import assert from 'assert'
import Path from 'path'
import CLI from './cli.js'

/** @test {CLI} */
describe('CLI', () => {
  /** @test {CLIl#parse} */
  describe('parse', () => {
    it('parse: Empty arguments', () => {
      const options = CLI.parse([])
      assert(options.help)
    })

    it('parse: -h --help', () => {
      let options = CLI.parse(['-h'])
      assert(options.help)

      options = CLI.parse(['--help'])
      assert(options.help)
    })

    it('parse: -v --version', () => {
      let options = CLI.parse(['-v'])
      assert(options.version)

      options = CLI.parse(['--version'])
      assert(options.version)
    })

    it('parse: -m --modes', () => {
      let options = CLI.parse(['-m', 'XXX'])
      assert(options.modes.length === 3)

      options = CLI.parse(['--modes', 'XXX'])
      assert(options.modes.length === 3)

      options = CLI.parse(['-m', 'ico'])
      assert(options.modes.length === 1)

      options = CLI.parse(['-m', 'ico,icns,favicon'])
      assert(options.modes.length === 3)

      options = CLI.parse(['-m', 'ico,XXX,icns'])
      assert(options.modes.length === 2)
    })

    it('parse: -i SVGFILE -o DESTDIR', () => {
      const argv = [
        '-i',  './test/data/sample.svg',
        '-o', './test'
      ]

      const options = CLI.parse(argv)

      const actualInputPath = Path.resolve(argv[1])
      assert(options.input === actualInputPath)

      const actualOutputPath = Path.resolve(argv[3])
      assert(options.output === actualOutputPath)

      assert(options.type === 'svg')
      assert(!(options.report))
    })

    it('parse: -i PNGDIR -o DESTDIR -t png -r', () => {
      const argv = [
        '-i', './test/data',
        '-o', './test',
        '-t', 'png',
        '-r'
      ]

      const options = CLI.parse(argv)

      const actualInputPath = Path.resolve(argv[1])
      assert(options.input === actualInputPath)

      const actualOutputPath = Path.resolve(argv[3])
      assert(options.output === actualOutputPath)

      assert(options.type === 'png')
      assert(options.report)
    })
  })

  /** @test {CLI#_parseMode} */
  describe('_parseMode', () => {
    it('Default', () => {
      const modes = CLI._parseMode()
      assert.deepStrictEqual(modes, ['ico', 'icns', 'favicon'])
    })

    it('ico, icns, favicon', () => {
      const modes = CLI._parseMode('ico,icns,favicon')
      assert(modes.length === 3)
    })

    it('ico', () => {
      const modes = CLI._parseMode('ico')
      assert(modes[0] === 'ico')
    })

    it('icns', () => {
      const modes = CLI._parseMode('icns')
      assert(modes[0] === 'icns')
    })

    it('favicon', () => {
      const modes = CLI._parseMode('favicon')
      assert(modes[0] === 'favicon')
    })
  })

  /** @test {CLI#_parseNames} */
  describe('_parseNames', () => {
    it('ico & icns', () => {
      const names = CLI._parseNames('ico=foo,icns=bar')
      assert.deepStrictEqual({ ico: 'foo', icns: 'bar' }, names)
    })

    it('ico', () => {
      const names = CLI._parseNames('ico=foo')
      assert.deepStrictEqual({ ico: 'foo' }, names)
    })

    it('icns', () => {
      const names = CLI._parseNames('icns=bar')
      assert.deepStrictEqual({ icns: 'bar' }, names)
    })

    it('Invalid value', () => {
      const names = CLI._parseNames()
      assert.deepStrictEqual({}, names)
    })
  })

  /** @test {CLI#_parseSizes} */
  describe('_parseSizes', () => {
    it('ico & icns', () => {
      const sizes = CLI._parseSizes('ico=[16,24,32],icns=[16,24,64]')
      assert.deepStrictEqual({ ico: [16, 24, 32], icns: [16, 24, 64] }, sizes)
    })

    it('ico', () => {
      const sizes = CLI._parseSizes('ico=[16,24,32]')
      assert.deepStrictEqual({ ico: [16, 24, 32] }, sizes)
    })

    it('icns', () => {
      const sizes = CLI._parseSizes('icns=[16,24,64]')
      assert.deepStrictEqual({ icns: [16, 24, 64] }, sizes)
    })

    it('Invalid value', () => {
      const sizes = CLI._parseSizes()
      assert.deepStrictEqual({}, sizes)
    })
  })
})
