import assert from 'power-assert';
import Fs from 'fs';
import Path from 'path';
import Del from 'del';
import Logger from '../../src/lib/logger.js';
import PngGenerator from '../../src/lib/png-generator.js';
import { FaviconConstants } from '../../src/lib/favicon-generator.js';
import { IcoConstants } from '../../src/lib/ico-generator.js';
import { IcnsConstants } from '../../src/lib/icns-generator.js';
import { CLIConstatns } from '../../src/bin/cli-util.js';

/** @test {PngGenerator} */
describe( 'PngGenerator', () => {
  const rootDir = Path.resolve( './test' );
  const dataDir = Path.join( rootDir, 'data' );

  /** @test {PngGenerator#generetePNG} */
  it( 'generetePNG', () => {
    const svg = Fs.readFileSync( Path.join( dataDir, 'sample.svg' ) );
    assert( svg );

    const dir = PngGenerator.createWorkDir();
    assert( dir );

    const size = 16;
    PngGenerator
    .generetePNG( svg, size, dir, new Logger() )
    .then( ( result ) => {
      assert( result.size === size );
      Del.sync( [ dir ], { force: true } );
    } )
    .catch( ( err ) => {
      console.error( err );
      assert();
      Del.sync( [ dir ], { force: true } );
    } );
  } );

  /** @test {PngGenerator#createWorkDir} */
  it( 'createWorkDir', () => {
    const dir = PngGenerator.createWorkDir();
    assert( dir );

    Del.sync( [ dir ], { force: true } );
  } );

  /** @test {PngGenerator#getRequiredImageSizes} */
  it( 'getRequiredImageSizes', () => {
    let   expected = PngGenerator.getRequiredImageSizes();
    const actual   = [ 16, 24, 32, 48, 57, 64, 72, 96, 120, 128, 144, 152, 195, 228, 256, 512, 1024 ];
    assert.deepEqual( expected, actual );

    expected = PngGenerator.getRequiredImageSizes( [ CLIConstatns.modes.ico ] );
    assert.deepEqual( expected, IcoConstants.imageSizes );

    expected = PngGenerator.getRequiredImageSizes( [ CLIConstatns.modes.icns ] );
    assert.deepEqual( expected, IcnsConstants.imageSizes );

    expected = PngGenerator.getRequiredImageSizes( [ CLIConstatns.modes.favicon ] );
    assert.deepEqual( expected, FaviconConstants.imageSizes );
  } );
} );
