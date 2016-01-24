import OS from 'os';
import Fs from 'fs';
import Path from 'path';
import UUID from 'node-uuid';
import SVG2PNG from 'svg2png';
import { ImageSizes } from './constants.js';

/**
 * Create a image ( PNG ) files from SVG file.
 */
export default class ImageFileCreator {
  /**
   * Create a image ( PNG ) files from SVG file.
   *
   * @param  {Function} cb Callback function.
   */
  createImages( src, cb ) {
    Fs.readFile( src, ( err, svg ) => {
      if( err ) {
        cb( err );
        return;
      }

      this._createImages( svg, cb );
    } );
  }

  /**
   * Create a image ( PNG ) files from SVG data.
   *
   * @param {Buffer}   svg SVG data.
   * @param {Function} cb  Callback function.
   */
  _createImages( svg, cb ) {
    const dir = this._setupWorkDir();
    if( !( dir ) ) {
      cb( new Error( 'Failed to setup the work directory.' ) );
      return;
    }

    const sizes = this._setupSizes();
    Promise
    .all( sizes.map( ( size ) => {
      return this._createImage( svg, size, dir );
    } ) )
    .then( ( results ) => {
      cb( null, results );
    } )
    .catch( ( err ) => {
      cb( err );
    } );
  }

  /**
   * Create a image ( PNG ) file from SVG data.
   *
   * @param {Buffer} src  SVG data.
   * @param {Number} size Image's width and height.
   * @param {String} dir  Path of the file output directory.
   *
   * @return {Promise} Promise object.
   */
  _createImage( src, size, dir ) {
    return new Promise( ( resolve, reject ) => {
      const buffer = SVG2PNG.sync( src, { width: size, height: size } );
      if( !( buffer ) ) {
        reject( new Error( 'Faild to write the image, ' + size + 'x' + size ) );
        return;
      }

      const dest = Path.join( dir, size + '.png' );
      Fs.writeFile( buffer, dest, ( err ) => {
        if( err ) {
          reject( err );
          return;
        }

        resolve( dest );
      } );
    } );
  }

  /**
   * Setup the work directory.
   *
   * @return {String} Success is directory path, null otherwise.
   */
  _setupWorkDir() {
    const dir = Path.join( OS.tmpdir(), UUID.v4() );
    Fs.mkdirSync( dir );

    const stat = Fs.statSync( dir );
    return ( stat && stat.isDirectory() ? dir : null );
  }

  /**
   * Setup a collection of the required image size.
   *
   * @return {Array.<Number>} collection of the required image size.
   */
  _setupSizes() {
    const keys  = Object.keys( ImageSizes );
    let   sizes = [];

    keys.forEach( ( key ) => {
      sizes = sizes.concat( ImageSizes[ key ] );
    } );

    return sizes.filter( ( value, index, array ) => {
      return ( array.indexOf( value ) === index );
    } );
  }
}
