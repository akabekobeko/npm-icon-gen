import assert from 'power-assert';
import Fs from 'fs';
import Path from 'path';
import ImageFileCreator from '../src/image-file-creator.js';

/** @test {ImageFileCreator} */
describe( 'ImageFileCreator', () => {
  /** @test {ImageFileCreator#createImage} */
  it( 'createImage', () => {
    const svg = Fs.readFileSync( Path.resolve( './test/test.svg' ) );
    assert( svg );

    const imageFileCreator = new ImageFileCreator();
    return imageFileCreator.createImage( svg, 16, Path.resolve( './test' ) )
    .then( ( result ) => {
      assert( result.size === 16 );
      assert( result.stat );

      const path = Path.join( Path.resolve( './test' ), '16.png' );
      assert( result.path === path );
      Fs.unlinkSync( result.path );
    } );
  } );

  /** @test {ImageFileCreator#createWorkDir} */
  it( 'createWorkDir', () => {
    const imageFileCreator = new ImageFileCreator();
    const dir              = imageFileCreator.createWorkDir();
    assert( dir );

    imageFileCreator.deleteWorkDir();
  } );

  /** @test {ImageFileCreator#getRequiredSizes} */
  it( 'getRequiredSizes', () => {
    const imageFileCreator = new ImageFileCreator();
    const expected         = imageFileCreator.getRequiredSizes();
    const actual           = [ 16, 24, 32, 48, 57, 64, 72, 96, 120, 128, 144, 152, 195, 228, 256, 512, 1024 ];

    assert( expected.length === actual.length );
    assert.deepEqual( expected, actual );
  } );
} );
