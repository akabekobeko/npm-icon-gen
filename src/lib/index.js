import GenerateIcon from './icon-generator.js'

/**
 * Generate an icon = require(the SVG file.
 * @param {String} src SVG file path.
 * @param {String} dest Destination directory path.
 * @param {Object} options Options.
 */
module.exports = function(src, dest, options = {}) {
  if (!src) {
    return console.error(new Error('"input" has not been specified. This parameter is required.'))
  }

  if (!dest) {
    return console.error(new Error('"-o" or "--output" has not been specified. This parameter is required.'))
  }

  GenerateIcon(src, dest, options)
}
