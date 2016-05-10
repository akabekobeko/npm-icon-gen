import assert from 'assert';
import Path from 'path';
import TestUtil from '../test-util.js';
import Logger from '../../src/lib/logger.js';
import FaviconGenerator from '../../src/lib/favicon-generator.js';
import { FaviconConstants } from '../../src/lib/favicon-generator.js';

/** @test {FaviconGenerator} */
describe( 'FaviconGenerator', () => {
  const testDir = Path.resolve( './test' );
  const dataDir = Path.join( testDir, 'data' );

  /** @test {FaviconGenerator#generate} */
  it( 'generate', () => {
    const images = FaviconConstants.imageSizes.map( ( size ) => {
      const path = Path.join( dataDir, size + '.png' );
      return { size: size, path: path };
    } );

    return FaviconGenerator
    .generate( images, testDir, new Logger() )
    .then( ( results ) => {
      assert( results );
      TestUtil.deleteFiles( results );
    } );
  } );
} );
