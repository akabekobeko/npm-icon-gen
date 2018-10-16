import GenerateIcon from './icon-generator.js'
import Logger from './logger.js'
import { DEFAULT_OPTIONS } from '../bin/cli.js'

/**
 * Generate an icon = require(the SVG file.
 * @param {String} src SVG file path.
 * @param {String} dest Destination directory path.
 * @param {Object} options Options.
 */
module.exports = function(src, dest, options = DEFAULT_OPTIONS) {
  const opt = options
  if (!opt.modes) {
    opt.modes = DEFAULT_OPTIONS.modes
  }

  if (!opt.names) {
    opt.names = DEFAULT_OPTIONS.names
  }

  if (!opt.names.ico) {
    opt.names.ico = DEFAULT_OPTIONS.names.ico
  }

  if (!opt.names.icns) {
    opt.names.icns = DEFAULT_OPTIONS.names.icns
  }

  const logger = new Logger(opt.report)
  GenerateIcon(opt.type, src, dest, opt, logger)
}
