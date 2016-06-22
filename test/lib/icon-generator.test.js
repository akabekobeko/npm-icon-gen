import assert from 'assert';
import Path from 'path';
import TestUtil from '../test-util.js';
import Logger from '../../src/lib/logger.js';
import IconGenerator from '../../src/lib/icon-generator.js';
import PngGenerator from '../../src/lib/png-generator.js';
import { IcoConstants } from '../../src/lib/ico-generator.js';
import { IcnsConstants } from '../../src/lib/icns-generator.js';
import { FaviconConstants } from '../../src/lib/favicon-generator.js';

/** @test {IconGenerator} */
describe( 'IconGenerator', () => {
  const testDir = Path.resolve( './test' );
  const dataDir = Path.join( testDir, 'data' );

  //
  /** @test {IconGenerator#fromSVG} */
  /*
  it( 'fromSVG', () => {
    return IconGenerator.fromSVG( './test/data/sample.svg', './test', new Logger() )
    .then( () => {
      assert( results );
      TestUtil.deleteFiles( results );
    } );
  } );
  */

  /** @test {IconGenerator#fromPNG} */
  it( 'fromPNG', () => {
    return IconGenerator.fromPNG( dataDir, './test', [], new Logger() )
    .then( ( results ) => {
      assert( results );
      TestUtil.deleteFiles( results );
    } );
  } );

  it( 'flattenValues', () => {
    const values   = [ 'A', 'B', [ 'C', 'D' ] ];
    const actual   = [ 'A', 'B',  'C', 'D' ];
    const expected = IconGenerator.flattenValues( values );

    assert.deepEqual( expected, actual );
  } );

  /** @test {IconGenerator#filter} */
  it( 'filter', () => {
    const targets = PngGenerator.getRequiredImageSizes().map( ( size ) => {
      return { size: size };
    } );

    let expected = IconGenerator.filter( targets, IcoConstants.imageSizes );
    assert( expected.length === 7 );

    expected = IconGenerator.filter( targets, IcnsConstants.imageSizes );
    assert( expected.length === 7 );

    expected = IconGenerator.filter( targets, FaviconConstants.imageSizes );
    assert( expected.length === 10 );

    expected = IconGenerator.filter( targets, FaviconConstants.icoImageSizes );
    assert( expected.length === 5 );
  } );
} );
