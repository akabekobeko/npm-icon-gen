import assert from 'power-assert';
import Fs from 'fs';
import Path from 'path';
import FaviconEditor from '../src/favicon-editor.js';
import { FaviconConstants } from '../src/favicon-editor.js';

/**
 * Delete an image files.
 *
 * @param {Array.<String>} images Path collection of an image files.
 */
function deleteImages( images ) {
  images.forEach( ( image ) => {
    try {
      const stat = Fs.statSync( image );
      if( stat && stat.isFile() ) {
        Fs.unlinkSync( image );
      }
    } catch( exp ) {
      console.error( exp );
    }
  } );
}

/** @test {FaviconEditor} */
describe( 'FaviconEditor', () => {
  const testDir = Path.resolve( './test' );
  const dataDir = Path.join( testDir, 'data' );

  /** @test {FaviconEditor#createImages} */
  it( 'createImages', ( done ) => {
    const images = FaviconConstants.imageSizes.map( ( size ) => {
      const path = Path.join( dataDir, size + '.png' );
      return { size: size, path: path, stat: Fs.statSync( path ) };
    } );

    FaviconEditor.createImages( images, testDir, ( err, results ) => {
      assert( !( err ) );
      assert( results );
      assert( 0 < results.length );

      deleteImages( results );
      done();
    } );
  } );
} );
