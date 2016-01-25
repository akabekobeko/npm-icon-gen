import ImageFileCreator from './image-file-creator.js';

/**
 * Generate an icon from the SVG file.
 *
 * @param {String}   src  SVG file path.
 * @param {String}   dest Destination directory path.
 * @param {Function} cb   Callback function.
 *
 * @return {Boolean} Success is true.
 */
module.exports = function icongen( src, dest, cb = () => {} ) {
  const imageFileCreator = new ImageFileCreator();
  imageFileCreator.createImages( src, ( err, images ) => {
    console.dir( images );
    if( err ) {
      console.error( err );
      imageFileCreator.deleteWorkDir();
      cb( err );
      return;
    }

    imageFileCreator.deleteWorkDir();
    cb();
  } );
};
