import OS from 'os';
import Fs from 'fs';
import Path from 'path';
import UUID from 'node-uuid';
import SVG2PNG from 'svg2png';
import Del from 'del';
import { FaviconImageSizes } from './favicon-editor.js';
import { IcoImageSizes } from './ico-editor.js';
import { IcnsImageSIzes } from './icns-editor.js';

/**
 * Create a image ( PNG ) files from SVG file.
 */
export default class ImageFileCreator {
  /**
   * Initialize instance.
   */
  constructor() {
    this._workDir = null;
  }

  /**
   * Create a image ( PNG ) files from SVG file.
   *
   * @param {String}   src SVG file path.
   * @param {Function} cb  Callback function.
   */
  createImages( src, cb ) {
    const path = Path.resolve( src );
    Fs.readFile( path, ( err, svg ) => {
      if( err ) {
        cb( err );
        return;
      }

      this.createWorkDir();
      if( !( this._workDir ) ) {
        cb( new Error( 'Failed to setup the work directory.' ) );
        return;
      }

      const sizes = this.getRequiredSizes();
      Promise
      .all( sizes.map( ( size ) => {
        return this.createImage( svg, size, this._workDir );
      } ) )
      .then( ( results ) => {
        cb( null, results );
      } )
      .catch( ( err2 ) => {
        cb( err2 );
      } );
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
  createImage( src, size, dir ) {
    return new Promise( ( resolve, reject ) => {
      if( !( src && 0 < size && dir ) ) {
        reject( new Error( 'Invalid parameters.' ) );
        return;
      }

      const buffer = SVG2PNG.sync( src, { width: size, height: size } );
      if( !( buffer ) ) {
        reject( new Error( 'Faild to write the image, ' + size + 'x' + size ) );
        return;
      }

      const dest = Path.join( dir, size + '.png' );
      console.log( 'Create: ' + dest );
      Fs.writeFile( dest, buffer, ( err ) => {
        if( err ) {
          reject( err );
          return;
        }

        const stat = Fs.statSync( dest );
        resolve( {
          size: size,
          path: dest,
          stat: stat
        } );
      } );
    } );
  }

  /**
   * Setup the work directory.
   */
  createWorkDir() {
    this.deleteWorkDir();

    const dir = Path.join( OS.tmpdir(), UUID.v4() );
    Fs.mkdirSync( dir );

    const stat = Fs.statSync( dir );
    this._workDir = ( stat && stat.isDirectory() ? dir : null );

    return this._workDir;
  }

  /**
   * Delete a temporary image files.
   */
  deleteWorkDir() {
    if( this._workDir ) {
      Del.sync( [ this._workDir ], { force: true } );
      this._workDir = null;
    }
  }

  /**
   * Setup a collection of the required image size.
   *
   * @return {Array.<Number>} collection of the required image size.
   */
  getRequiredSizes() {
    const sizes = FaviconImageSizes.concat( IcoImageSizes ).concat( IcnsImageSIzes );
    return sizes.filter( ( value, index, array ) => {
      return ( array.indexOf( value ) === index );
    } );
  }
}
