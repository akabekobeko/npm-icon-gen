import assert from 'power-assert';
import Fs from 'fs';
import Path from 'path';
import Del from 'del';
import PngGenerator from '../../src/lib/png-generator.js';

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
    .generetePNG( svg, size, dir )
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
    const expected = PngGenerator.getRequiredImageSizes();
    const actual   = [ 16, 24, 32, 48, 57, 64, 72, 96, 120, 128, 144, 152, 195, 228, 256, 512, 1024 ];

    assert( expected.length === actual.length );
    assert.deepEqual( expected, actual );
  } );
} );
