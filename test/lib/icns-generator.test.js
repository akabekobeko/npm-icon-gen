import assert from 'assert';
import Fs from 'fs';
import Path from 'path';
import Logger from '../../src/lib/logger.js';
import IcnsGenerator from '../../src/lib/icns-generator.js';
import { IcnsConstants } from '../../src/lib/icns-generator.js';

/** @test {IcnsGenerator} */
describe( 'IcnsGenerator', () => {
  const testDir = Path.resolve( './test' );
  const dataDir = Path.join( testDir, 'data' );

  /** @test {IcnsGenerator#generate} */
  it( 'generate', () => {
    const images = IcnsConstants.imageSizes.map( ( size ) => {
      const path = Path.join( dataDir, size + '.png' );
      return { size: size, path: path };
    } );

    return IcnsGenerator
    .generate( images, Path.join( testDir, 'sample.icns' ), new Logger() )
    .then( ( result ) => {
      assert( result );
      Fs.unlinkSync( result );
    } );
  } );

  /** @test {IcnsGenerator#createFileHeader} */
  it( 'createFileHeader', () => {
    const header = IcnsGenerator.createFileHeader( 32 );

    // In ASCII "icns"
    assert( header.readUInt8( 0 ) === 0x69 );
    assert( header.readUInt8( 1 ) === 0x63 );
    assert( header.readUInt8( 2 ) === 0x6e );
    assert( header.readUInt8( 3 ) === 0x73 );

    // File size
    assert( header.readUInt32BE( 4 ) === 32 );
  } );

  /** @test {IcnsGenerator#createIconHeader} */
  it( 'createIconHeader', () => {
    const header = IcnsGenerator.createIconHeader( IcnsConstants.iconIDs[ 0 ], 128 );

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
