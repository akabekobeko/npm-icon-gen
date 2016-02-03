import assert from 'power-assert';
import Fs from 'fs';
import Path from 'path';
import IcoEditor from '../src/ico-editor.js';
import { IcoConstants } from '../src/ico-editor.js';

/** @test {IcoEditor} */
describe( 'IcoEditor', () => {
  const rootDir = Path.resolve( './test' );
  const dataDir = Path.join( rootDir, 'data' );

  /** @test {ICOEditor#write} */
  it( 'write', ( done ) => {
    const targets = IcoConstants.imageSizes.map( ( size ) => {
      const path = Path.join( dataDir, size + '.png' );
      return { size: size, path: path, stat: Fs.statSync( path ) };
    } );

    const dest = Path.join( rootDir, 'sample.ico' );
    IcoEditor.write( targets, dest, ( err ) => {
      assert( !( err ) );
      Fs.unlinkSync( dest );
      done();
    } );
  } );

  /** @test {ICOEditor#writeHeader} */
  it( 'writeHeader', () => {
    const buffer = new Buffer( IcoConstants.headerSize );
    IcoEditor.writeHeader( buffer, 1, 7 );

    const header = IcoEditor.readHeader( buffer );
    assert( header.reserved === 0 );
    assert( header.type     === 1 );
    assert( header.count    === 7 );
  } );

  /** @test {ICOEditor#writeDirectory} */
  it( 'writeDirectory', () => {
    const buffer = new Buffer( IcoConstants.directorySize );
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

    IcoEditor.writeDirectory( buffer, 0, actual );
    const expected = IcoEditor.readDirectory( buffer, 0 );
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

    const buffer = new Buffer( IcoConstants.headerSize + ( IcoConstants.directorySize * targets.length ) );
    IcoEditor.writeHeader( buffer, 1, targets.length );
    IcoEditor.writeDirectories( buffer, targets );
  } );
} );
