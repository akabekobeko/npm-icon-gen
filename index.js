const IconGenerator = require( './icon-generator.js' );

/**
 * Generate an icon from the SVG file.
 *
 * @param {String} src     SVG file path.
 * @param {String} dest    Destination directory path.
 * @param {Object} options Options.
 */
module.exports = function( src, dest, options = { type: 'svg', report: false } ) {
  switch( options.type ) {
    case 'png':
      return IconGenerator.fromPNG( src, dest );

    default:
      return IconGenerator.fromSVG( src, dest );
  }
};
