import assert from 'power-assert';
import IconGenerator from '../src/lib/icon-generator.js';
import PngGenerator from '../src/lib/png-generator.js';
import { IcoConstants } from '../src/lib/ico-generator.js';
import { IcnsConstants } from '../src/lib/icns-generator.js';
import { FaviconConstants } from '../src/lib/favicon-generator.js';

/** @test {IconGenerator} */
describe( 'IconGenerator', () => {
  /** @test {IconGenerator#filter} */
  it( 'filter', () => {
    const targets = PngGenerator.getRequiredImageSizes().map( ( size ) => {
      return { size: size };
    } );

    let expected = IconGenerator.filter( targets, IcoConstants.imageSizes );
    assert( expected.length === 7 );

    expected = IconGenerator.filter( targets, IcnsConstants.imageSizes );
    assert( expected.length === 6 );

    expected = IconGenerator.filter( targets, FaviconConstants.imageSizes );
    assert( expected.length === 10 );

    expected = IconGenerator.filter( targets, FaviconConstants.icoImageSizes );
    assert( expected.length === 5 );
  } );
} );
