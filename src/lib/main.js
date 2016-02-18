import IconGenerator from './icon-generator.js';
import Logger from './logger.js';
import { CLIConstatns } from '../bin/cli-util.js';

/**
 * Generate an icon from the SVG file.
 *
 * @param {String} src     SVG file path.
 * @param {String} dest    Destination directory path.
 * @param {Object} options Options.
 */
module.exports = function( src, dest, options = { type: CLIConstatns.types.svg, modes: CLIConstatns.modeAll, report: false } ) {
  const logger = new Logger( options.report );
  switch( options.type ) {
    case CLIConstatns.types.png:
      return IconGenerator.fromPNG( src, dest, options.modes, logger );

    default:
      return IconGenerator.fromSVG( src, dest, options.modes, logger );
  }
};
