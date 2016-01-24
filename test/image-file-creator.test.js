import assert from 'power-assert';
import ImageFileCreator from '../lib/image-file-creator.js';

/** @test {ImageFileCreator} */
describe( 'ImageFileCreator', () => {
  /** @test {ImageFileCreator#_setupSizes} */
  it( '_setupSizes', () => {
    const imageFileCreator = new ImageFileCreator();
    const expected         = imageFileCreator._setupSizes();
    const actual           = [ 16, 24, 32, 48, 57, 64, 72, 96, 120, 128, 144, 152, 195, 228, 256, 512, 1024 ];

    assert( expected.length === actual.length );
    assert.deepEqual( expected, actual );
  } );
} );
