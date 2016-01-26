import assert from 'power-assert';
import Fs from 'fs';
import Path from 'path';
import ICOEditor from '../src/ico-editor.js';
import { ICOSpec, ImageSizes } from '../src/constants.js';

/** @test {ICOEditor} */
describe( 'ICOEditor', () => {
  /** @test {ICOEditor#generate} */
  it( 'generate', ( done ) => {
    const targets = ImageSizes.windows.map( ( size ) => {
      const path = Path.resolve(  './test/' + size + '.png' );
      return { size: size, path: path, stat: Fs.statSync( path ) };
    } );

    const dest    = Path.resolve( './test/test.ico' );
    ICOEditor.write( targets, dest, ( err ) => {
      assert( !( err ) );
      Fs.unlinkSync( dest );
      done();
    } );
  } );

  /** @test {ICOEditor#writeHeader} */
  it( 'writeHeader', () => {
    const buffer = new Buffer( ICOSpec.headerSize );
    ICOEditor.writeHeader( buffer, 1, 7 );

    const header = ICOEditor.readHeader( buffer );
    assert( header.reserved === 0 );
    assert( header.type     === 1 );
    assert( header.count    === 7 );
  } );

  /** @test {ICOEditor#writeDirectory} */
  it( 'writeDirectory', () => {
    const buffer = new Buffer( ICOSpec.directorySize );
    const actual = {
      width:     16,
      height:    16,
      colors:     0, // 256 colors or more, 32bit
      reserved:   0,
      planes:     1, // ICO file
      bpp:       32, // Alpha PNG
      size:     701,
      offset:     0
    };

    ICOEditor.writeDirectory( buffer, 0, actual );
    const expected = ICOEditor.readDirectory( buffer, 0 );
    assert.deepEqual( expected, actual );
  } );

  it( 'Header & Directory', () => {
    const targets = [
      { size:  16, stat: { size:  701 } },
      { size:  24, stat: { size: 1164 } },
      { size:  32, stat: { size: 1633 } },
      { size:  48, stat: { size: 2766 } },
      { size:  64, stat: { size: 3853 } },
      { size: 128, stat: { size: 8477 } },
      { size: 256, stat: { size: 17540 } }
    ];

    const buffer = new Buffer( ICOSpec.headerSize + ( ICOSpec.directorySize * targets.length ) );
    ICOEditor.writeHeader( buffer, 1, targets.length );
    ICOEditor.writeDirectories( buffer, targets );
  } );
} );
