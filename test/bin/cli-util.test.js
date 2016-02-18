import assert from 'power-assert';
import Path from 'path';
import CLIUtil from '../../src/bin/cli-util.js';
import { CLIConstatns } from '../../src/bin/cli-util.js';

/** @test {CLIUtil} */
describe( 'CLIUtil', () => {
  /** @test {CLIUtil#parse} */
  it( 'parse: Empty arguments', () => {
    const options = CLIUtil.parse( [] );
    assert( options.help );
  } );

  /** @test {CLIUtil#parse} */
  it( 'parse: -h --help', () => {
    let options = CLIUtil.parse( [ CLIConstatns.options.help[ 0 ] ] );
    assert( options.help );

    options = CLIUtil.parse( [ CLIConstatns.options.help[ 1 ] ] );
    assert( options.help );
  } );

  /** @test {CLIUtil#parse} */
  it( 'parse: -v --version', () => {
    let options = CLIUtil.parse( [ CLIConstatns.options.version[ 0 ] ] );
    assert( options.version );

    options = CLIUtil.parse( [ CLIConstatns.options.version[ 1 ] ] );
    assert( options.version );
  } );

  /** @test {CLIUtil#parse} */
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

  /** @test {CLIUtil#parse} */
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

  /** @test {CLIUtil#parse} */
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
