import assert from 'power-assert';
import Fs from 'fs';
import Path from 'path';
import Logger from '../../src/lib/logger.js';
import IcoGenerator from '../../src/lib/ico-generator.js';
import { IcoConstants } from '../../src/lib/ico-generator.js';

/** @test {IcoGenerator} */
describe( 'IcoGenerator', () => {
  const rootDir = Path.resolve( './test' );
  const dataDir = Path.join( rootDir, 'data' );

  /** @test {IcoGenerator#generate} */
  it( 'generate', ( done ) => {
    const targets = IcoConstants.imageSizes.map( ( size ) => {
      const path = Path.join( dataDir, size + '.png' );
      return { size: size, path: path, stat: Fs.statSync( path ) };
    } );

    IcoGenerator
    .generate( targets, Path.join( rootDir, 'sample.ico' ), new Logger() )
    .then( ( result ) => {
      assert( result );
      Fs.unlinkSync( result );
      done();
    } );
  } );

  /** @test {IcoGenerator#createFileHeader} */
  it( 'createFileHeader', () => {
    const count = 7;
    const b = IcoGenerator.createFileHeader( count );

    assert( b.readUInt16LE( 0 ) === 0 );
    assert( b.readUInt16LE( 2 ) === 1 );
    assert( b.readUInt16LE( 4 ) === count );
  } );

  /** @test {IcoGenerator#createDirectory} */
  it( 'createDirectory', () => {
    const png = {
      width: 16,
      height: 16,
      bpp: 4,
      data: {
        length: 1024
      }
    };

    const offset = IcoConstants.headerSize + IcoConstants.directorySize;
    const b      = IcoGenerator.createDirectory( png, offset );

    assert( b.readUInt8( 0 ) === png.width );
    assert( b.readUInt8( 1 ) === png.height );
    assert( b.readUInt8( 2 ) === 0 );
    assert( b.readUInt8( 3 ) === 0 );
    assert( b.readUInt16LE( 4 ) === 1 );
    assert( b.readUInt16LE( 6 ) === png.bpp * 8 );
    assert( b.readUInt32LE( 8 ) === png.data.length + IcoConstants.BitmapInfoHeaderSize );
    assert( b.readUInt32LE( 12 ) === offset );
  } );

  /** @test {IcoGenerator#createBitmapInfoHeader} */
  it( 'createBitmapInfoHeader', () => {
    const png = {
      width: 16,
      height: 16,
      bpp: 4,
      data: {
        length: 1024
      }
    };

    const b = IcoGenerator.createBitmapInfoHeader( png, IcoConstants.BI_RGB );
    assert( b.readUInt32LE( 0 ) === IcoConstants.BitmapInfoHeaderSize );
    assert( b.readInt32LE( 4 ) === png.width );
    assert( b.readInt32LE( 8 ) === png.height * 2 );
    assert( b.readUInt16LE( 12 ) === 1 );
    assert( b.readUInt16LE( 14 ) === png.bpp * 8 );
    assert( b.readUInt32LE( 16 ) === IcoConstants.BI_RGB );
    assert( b.readUInt32LE( 20 ) === png.data.length );
    assert( b.readInt32LE( 24 ) === 0 );
    assert( b.readInt32LE( 28 ) === 0 );
    assert( b.readUInt32LE( 32 ) === 0 );
    assert( b.readUInt32LE( 36 ) === 0 );
  } );
} );
