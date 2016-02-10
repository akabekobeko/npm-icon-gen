import assert from 'power-assert';
import Fs from 'fs';
import Path from 'path';
import FaviconGenerator from '../src/lib/favicon-generator.js';
import { FaviconConstants } from '../src/lib/favicon-generator.js';

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

/** @test {FaviconGenerator} */
describe( 'FaviconEditor', () => {
  const testDir = Path.resolve( './test' );
  const dataDir = Path.join( testDir, 'data' );

  /** @test {FaviconGenerator#generate} */
  it( 'generate', ( done ) => {
    const images = FaviconConstants.imageSizes.map( ( size ) => {
      const path = Path.join( dataDir, size + '.png' );
      return { size: size, path: path };
    } );

    const icoImages = FaviconConstants.icoImageSizes.map( ( size ) => {
      const path = Path.join( dataDir, size + '.png' );
      return { size: size, path: path };
    } );

    FaviconGenerator.generate( images, icoImages, testDir, ( err, results ) => {
      assert( !( err ) );
      assert( results );
      assert( 0 < results.length );

      deleteImages( results );
      done();
    } );
  } );
} );
