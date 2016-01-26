import IconGenerator from './icon-generator.js';

/**
 * Generate an icon from the SVG file.
 *
 * @param {String}   src  SVG file path.
 * @param {String}   dest Destination directory path.
 * @param {Function} cb   Callback function.
 */
module.exports = function icongen( src, dest, cb = () => {} ) {
  IconGenerator.fromSVG( src, dest, cb );
};
