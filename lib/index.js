import ImageFileCreator from './image-file-creator.js';

/**
 * Generate an icon from the SVG file.
 *
 * @param {String} src SVG file path.
 * @param {String} dest Destination directory path.
 *
 * @return {Boolean} Success is true.
 */
export default function icongen( src, dest ) {
  const imageFileCreator = new ImageFileCreator();
  imageFileCreator.createImages( src, ( err, images ) => {
    if( err ) {
      console.error( err );
      return;
    }

    console.log( images );
  } );
}
