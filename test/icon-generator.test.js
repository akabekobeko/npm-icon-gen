import assert from 'power-assert';
import IconGenerator from '../src/icon-generator.js';
import ImageFileCreator from '../src/image-file-creator.js';
import { IcoConstants } from '../src/ico-editor.js';
import { IcnsConstants } from '../src/icns-editor.js';
import { FaviconConstants } from '../src/favicon-editor.js';

/** @test {IconGenerator} */
describe( 'IconGenerator', () => {
  /** @test {IconGenerator#filter} */
  it( 'filter', () => {
    const imageFileCreator = new ImageFileCreator();
    const targets = imageFileCreator.getRequiredSizes().map( ( size ) => {
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
