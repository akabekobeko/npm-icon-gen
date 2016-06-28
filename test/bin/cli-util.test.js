import assert from 'assert';
import Path from 'path';
import CLIUtil from '../../src/bin/cli-util.js';
import { CLIConstatns } from '../../src/bin/cli-util.js';

/** @test {CLIUtil} */
describe( 'CLIUtil', () => {
  /** @test {CLIUtil#parse} */
  describe( 'parse', () => {
    it( 'parse: Empty arguments', () => {
      const options = CLIUtil.parse( [] );
      assert( options.help );
    } );

    it( 'parse: -h --help', () => {
      let options = CLIUtil.parse( [ CLIConstatns.options.help[ 0 ] ] );
      assert( options.help );

      options = CLIUtil.parse( [ CLIConstatns.options.help[ 1 ] ] );
      assert( options.help );
    } );

    it( 'parse: -v --version', () => {
      let options = CLIUtil.parse( [ CLIConstatns.options.version[ 0 ] ] );
      assert( options.version );

      options = CLIUtil.parse( [ CLIConstatns.options.version[ 1 ] ] );
      assert( options.version );
    } );

    it( 'parse: -m --modes', () => {
      let options = CLIUtil.parse( [ CLIConstatns.options.modes[ 0 ], 'XXX' ] );
      assert( options.modes.length === CLIConstatns.modeAll.length );

      options = CLIUtil.parse( [ CLIConstatns.options.modes[ 1 ], 'XXX' ] );
      assert( options.modes.length === CLIConstatns.modeAll.length );

      options = CLIUtil.parse( [ CLIConstatns.options.modes[ 0 ], 'ico' ] );
      assert( options.modes.length === 1 );

      options = CLIUtil.parse( [ CLIConstatns.options.modes[ 0 ], 'ico,icns,favicon' ] );
      assert( options.modes.length === 3 );

      options = CLIUtil.parse( [ CLIConstatns.options.modes[ 0 ], 'ico,XXX,icns' ] );
      assert( options.modes.length === 2 );
    } );

    it( 'parse: -i SVGFILE -o DESTDIR', () => {
      const argv = [
        CLIConstatns.options.input[ 0 ],  './test/data/sample.svg',
        CLIConstatns.options.output[ 0 ], './test'
      ];

      const options = CLIUtil.parse( argv );

      const actualInputPath = Path.resolve( argv[ 1 ] );
      assert( options.input === actualInputPath );

      const actualOutputPath = Path.resolve( argv[ 3 ] );
      assert( options.output === actualOutputPath );

      assert( options.type === CLIConstatns.types.svg );
      assert( !( options.report ) );
    } );

    it( 'parse: -i PNGDIR -o DESTDIR -t png -r', () => {
      const argv = [
        CLIConstatns.options.input[ 0 ],  './test/data',
        CLIConstatns.options.output[ 0 ], './test',
        CLIConstatns.options.type[ 0 ],   CLIConstatns.types.png,
        CLIConstatns.options.report[ 0 ]
      ];

      const options = CLIUtil.parse( argv );

      const actualInputPath = Path.resolve( argv[ 1 ] );
      assert( options.input === actualInputPath );

      const actualOutputPath = Path.resolve( argv[ 3 ] );
      assert( options.output === actualOutputPath );

      assert( options.type === CLIConstatns.types.png );
      assert( options.report );
    } );
  } );

  /** @test {CLIUtil#_parseMode} */
  describe( '_parseMode', () => {
    it( 'Default', () => {
      const modes = CLIUtil._parseMode();
      assert.deepEqual( modes, CLIConstatns.modeAll );
    } );

    it( 'ico, icns, favicon', () => {
      const modes = CLIUtil._parseMode( 'ico,icns,favicon' );
      assert( modes.length === CLIConstatns.modeAll.length );
    } );

    it( 'ico', () => {
      const modes = CLIUtil._parseMode( 'ico' );
      assert( modes[ 0 ] === CLIConstatns.modes.ico );
    } );

    it( 'icns', () => {
      const modes = CLIUtil._parseMode( 'icns' );
      assert( modes[ 0 ] === CLIConstatns.modes.icns );
    } );

    it( 'favicon', () => {
      const modes = CLIUtil._parseMode( 'favicon' );
      assert( modes[ 0 ] === CLIConstatns.modes.favicon );
    } );
  } );

  /** @test {CLIUtil#_parseNames} */
  describe( '_parseNames', () => {
    it( 'ico & icns', () => {
      const names = CLIUtil._parseNames( 'ico=foo,icns=bar' );
      assert.deepEqual( { ico: 'foo', icns: 'bar' }, names );
    } );

    it( 'ico', () => {
      const names = CLIUtil._parseNames( 'ico=foo' );
      assert.deepEqual( { ico: 'foo' }, names );
    } );

    it( 'icns', () => {
      const names = CLIUtil._parseNames( 'icns=bar' );
      assert.deepEqual( { icns: 'bar' }, names );
    } );

    it( 'Invalid value', () => {
      const names = CLIUtil._parseNames();
      assert.deepEqual( {}, names );
    } );
  } );
} );
