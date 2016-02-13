import assert from 'power-assert';
import Path from 'path';
import TestUtil from '../test-util.js';
import FaviconGenerator from '../../src/lib/favicon-generator.js';
import { FaviconConstants } from '../../src/lib/favicon-generator.js';

/** @test {FaviconGenerator} */
describe( 'FaviconGenerator', () => {
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

      TestUtil.deleteFiles( results );
      done();
    } );
  } );
} );
