import assert from 'assert'
import { parseArgv } from './cli'

describe('cli', () => {
  describe('parseArgv', () => {
    describe('input', () => {
      it('--input', () => {
        const argv = ['', '', '--input', 'sample.svg']
        const options = parseArgv(argv)
        assert.strictEqual(options.input, 'sample.svg')
      })

      it('-i', () => {
        const argv = ['', '', '-i', 'sample.svg']
        const options = parseArgv(argv)
        assert.strictEqual(options.input, 'sample.svg')
      })
    })

    describe('output', () => {
      it('--output', () => {
        const argv = ['', '', '--output', './']
        const options = parseArgv(argv)
        assert.strictEqual(options.output, './')
      })

      it('-o', () => {
        const argv = ['', '', '-o', './']
        const options = parseArgv(argv)
        assert.strictEqual(options.output, './')
      })
    })

    describe('icon', () => {
      it('Defaults', () => {
        const argv = ['', '', '-i', 'sample.svg']
        const options = parseArgv(argv)
        assert.deepStrictEqual(options.icon, {
          report: false,
          icns: {},
          ico: {},
          favicon: {}
        })
      })
    })

    describe('icon.ico', () => {
      it('--ico', () => {
        const argv = ['', '', '--ico']
        const options = parseArgv(argv)
        assert.deepStrictEqual(options.icon, {
          report: false,
          ico: {}
        })
      })

      it('--ico-name', () => {
        const argv = ['', '', '--ico', '--ico-name', 'sample']
        const options = parseArgv(argv)
        assert.deepStrictEqual(options.icon, {
          report: false,
          ico: { name: 'sample' }
        })
      })

      it('--ico-sizes', () => {
        const argv = ['', '', '--ico', '--ico-sizes', '24,32']
        const options = parseArgv(argv)
        assert.deepStrictEqual(options.icon, {
          report: false,
          ico: { sizes: [24, 32] }
        })
      })
    })

    describe('icon.icns', () => {
      it('--icns', () => {
        const argv = ['', '', '--icns']
        const options = parseArgv(argv)
        assert.deepStrictEqual(options.icon, {
          report: false,
          icns: {}
        })
      })

      it('--icns-name', () => {
        const argv = ['', '', '--icns', '--icns-name', 'sample']
        const options = parseArgv(argv)
        assert.deepStrictEqual(options.icon, {
          report: false,
          icns: { name: 'sample' }
        })
      })

      it('--icns-sizes', () => {
        const argv = ['', '', '--icns', '--icns-sizes', '24,32']
        const options = parseArgv(argv)
        assert.deepStrictEqual(options.icon, {
          report: false,
          icns: { sizes: [24, 32] }
        })
      })
    })

    describe('icon.favicon', () => {
      it('--favicon', () => {
        const argv = ['', '', '--favicon']
        const options = parseArgv(argv)
        assert.deepStrictEqual(options.icon, {
          report: false,
          favicon: {}
        })
      })

      it('--favicon-name', () => {
        const argv = ['', '', '--favicon', '--favicon-name', 'sample']
        const options = parseArgv(argv)
        assert.deepStrictEqual(options.icon, {
          report: false,
          favicon: { name: 'sample' }
        })
      })

      it('--favicon-png-sizes', () => {
        const argv = ['', '', '--favicon', '--favicon-png-sizes', '24,32']
        const options = parseArgv(argv)
        assert.deepStrictEqual(options.icon, {
          report: false,
          favicon: { pngSizes: [24, 32] }
        })
      })

      it('--favicon-ico-sizes', () => {
        const argv = ['', '', '--favicon', '--favicon-ico-sizes', '24,32']
        const options = parseArgv(argv)
        assert.deepStrictEqual(options.icon, {
          report: false,
          favicon: { icoSizes: [24, 32] }
        })
      })
    })
  })
})

/*
import assert from 'assert'
import Path from 'path'

describe('CLI', () => {
  const Module = Rewire('./cli.js')

  describe('parse', () => {
    const parse = Module.__get__('parse')

    it('Empty arguments', () => {
      const options = parse([])
      assert(options.help)
    })

    it('parse: -h --help', () => {
      let options = parse(['-h'])
      assert(options.help)

      options = parse(['--help'])
      assert(options.help)
    })

    it('-v --version', () => {
      let options = parse(['-v'])
      assert(options.version)

      options = parse(['--version'])
      assert(options.version)
    })

    it('-i SVGFILE -o DESTDIR', () => {
      const argv = ['-i', './test/data/sample.svg', '-o', './test']
      const options = parse(argv)

      let expected = Path.resolve(argv[1])
      assert(options.input === expected)

      expected = Path.resolve(argv[3])
      assert(options.output === expected)

      assert(options.report === undefined)
    })

    it('-i PNGDIR -o DESTDIR -r', () => {
      const argv = ['-i', './test/data', '-o', './test', '-r']
      const options = parse(argv)

      let expected = Path.resolve(argv[1])
      assert(options.input === expected)

      expected = Path.resolve(argv[3])
      assert(options.output === expected)

      assert(options.report === true)
    })

    it('Default images', () => {
      const argv = ['-i', './test/data', '-o', './test']
      const options = parse(argv)

      assert(options.ico !== undefined)
      assert(options.icns !== undefined)
      assert(options.favicon !== undefined)
    })

    describe('--ico', () => {
      it('Full options', () => {
        const argv = [
          '-i',
          './test/data',
          '-o',
          './test',
          '--ico',
          'name=foo',
          'sizes=16,32'
        ]
        const options = parse(argv)
        const expected = { name: 'foo', sizes: [16, 32] }
        assert.deepStrictEqual(options.ico, expected)
      })

      it('name', () => {
        const argv = ['-i', './test/data', '-o', './test', '--ico', 'name=foo']
        const options = parse(argv)
        const expected = { name: 'foo' }
        assert.deepStrictEqual(options.ico, expected)
      })

      it('sizes', () => {
        const argv = [
          '-i',
          './test/data',
          '-o',
          './test',
          '--ico',
          'sizes=16,32'
        ]
        const options = parse(argv)
        const expected = { sizes: [16, 32] }
        assert.deepStrictEqual(options.ico, expected)
      })

      it('Without options', () => {
        const argv = ['-i', './test/data', '-o', './test', '--ico']
        const options = parse(argv)
        assert(options.ico !== undefined)
        assert(options.icns === undefined)
        assert(options.favicon === undefined)
      })
    })

    describe('--icns', () => {
      it('Full options', () => {
        const argv = [
          '-i',
          './test/data',
          '-o',
          './test',
          '--icns',
          'name=foo',
          'sizes=16,32'
        ]
        const options = parse(argv)
        const expected = { name: 'foo', sizes: [16, 32] }
        assert.deepStrictEqual(options.icns, expected)
      })

      it('name', () => {
        const argv = ['-i', './test/data', '-o', './test', '--icns', 'name=foo']
        const options = parse(argv)
        const expected = { name: 'foo' }
        assert.deepStrictEqual(options.icns, expected)
      })

      it('sizes', () => {
        const argv = [
          '-i',
          './test/data',
          '-o',
          './test',
          '--icns',
          'sizes=16,32'
        ]
        const options = parse(argv)
        const expected = { sizes: [16, 32] }
        assert.deepStrictEqual(options.icns, expected)
      })

      it('Without options', () => {
        const argv = ['-i', './test/data', '-o', './test', '--icns']
        const options = parse(argv)
        assert(options.ico === undefined)
        assert(options.icns !== undefined)
        assert(options.favicon === undefined)
      })
    })

    describe('--favicon', () => {
      it('Full options', () => {
        const argv = [
          '-i',
          './test/data',
          '-o',
          './test',
          '--favicon',
          'ico=24,48',
          'name=icon-',
          'sizes=16,32'
        ]
        const options = parse(argv)
        const expected = { ico: [24, 48], name: 'icon-', sizes: [16, 32] }
        assert.deepStrictEqual(options.favicon, expected)
      })

      it('ico', () => {
        const argv = [
          '-i',
          './test/data',
          '-o',
          './test',
          '--favicon',
          'ico=24,48'
        ]
        const options = parse(argv)
        const expected = { ico: [24, 48] }
        assert.deepStrictEqual(options.favicon, expected)
      })

      it('name', () => {
        const argv = [
          '-i',
          './test/data',
          '-o',
          './test',
          '--favicon',
          'name=icon-'
        ]
        const options = parse(argv)
        const expected = { name: 'icon-' }
        assert.deepStrictEqual(options.favicon, expected)
      })

      it('sizes', () => {
        const argv = [
          '-i',
          './test/data',
          '-o',
          './test',
          '--favicon',
          'sizes=16,32'
        ]
        const options = parse(argv)
        const expected = { sizes: [16, 32] }
        assert.deepStrictEqual(options.favicon, expected)
      })

      it('Without options', () => {
        const argv = ['-i', './test/data', '-o', './test', '--favicon']
        const options = parse(argv)
        assert(options.ico === undefined)
        assert(options.icns === undefined)
        assert(options.favicon !== undefined)
      })
    })
  })

  describe('parseArgOption', () => {
    const parseArgOption = Module.__get__('parseArgOption')

    it('key=value', () => {
      const actual = parseArgOption('name=foo')
      const expected = { name: 'name', value: 'foo' }
      assert.deepStrictEqual(actual, expected)
    })

    it('value', () => {
      const actual = parseArgOption('value')
      const expected = 'value'
      assert(actual === expected)
    })
  })
})
*/
