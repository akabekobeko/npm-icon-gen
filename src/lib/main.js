import IconGenerator from './icon-generator.js';
import Logger from './logger.js';

/**
 * Generate an icon from the SVG file.
 *
 * @param {String} src     SVG file path.
 * @param {String} dest    Destination directory path.
 * @param {Object} options Options.
 */
module.exports = function( src, dest, options = { type: 'svg', report: false } ) {
  const logger = new Logger( options.report );
  switch( options.type ) {
    case 'png':
      return IconGenerator.fromPNG( src, dest, logger );

    default:
      return IconGenerator.fromSVG( src, dest, logger );
  }
};
