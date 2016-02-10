import assert from 'power-assert';
import Fs from 'fs';
import Path from 'path';
import IcnsEditor from '../src/icns-editor.js';
import { IcnsConstants } from '../src/icns-editor.js';

/** @test {IcnsEditor} */
describe( 'IcnsEditor', () => {
  const testDir = Path.resolve( './test' );
  const dataDir = Path.join( testDir, 'data' );

  /** @test {IcnsEditor#create} */
  it( 'create', ( done ) => {
    const images = IcnsConstants.imageSizes.map( ( size ) => {
      const path = Path.join( dataDir, size + '.png' );
      return { size: size, path: path, stat: Fs.statSync( path ) };
    } );

    const dest = Path.join( testDir, 'sample.icns' );
    IcnsEditor.create( images, dest, ( err ) => {
      if( err ) {
        console.error( err );
      }

      assert( !( err ) );
      Fs.unlinkSync( dest );
      done();
    } );
  } );

  /** @test {IcnsEditor#createFileHeader} */
  it( 'createFileHeader', () => {
    const header = IcnsEditor.createFileHeader( 32 );

    // In ASCII "icns"
    assert( header.readUInt8( 0 ) === 0x69 );
    assert( header.readUInt8( 1 ) === 0x63 );
    assert( header.readUInt8( 2 ) === 0x6e );
    assert( header.readUInt8( 3 ) === 0x73 );

    // File size
    assert( header.readUInt32BE( 4 ) === 32 );
  } );

  /** @test {IcnsEditor#createIconHeader} */
  it( 'createIconHeader', () => {
    const header = IcnsEditor.createIconHeader( IcnsConstants.iconIDs[ 0 ], 128 );

    // In ASCII "ic07"
    assert( header.readUInt8( 0 ) === 0x69 );
    assert( header.readUInt8( 1 ) === 0x63 );
    assert( header.readUInt8( 2 ) === 0x30 );
    assert( header.readUInt8( 3 ) === 0x37 );

    // Image size
    const size = 128 + IcnsConstants.headerSize;
    assert( header.readUInt32BE( 4 ) === size );
  } );
} );
