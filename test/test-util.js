const Fs = require('fs')

/**
 * Utility for the test methods.
 */
class TestUtil {
  /**
   * Delete a files.
   *
   * @param {Array.<String>} paths File paths.
   */
  static deleteFiles (paths) {
    paths.forEach((path) => {
      try {
        const stat = Fs.statSync(path)
        if (stat && stat.isFile()) {
          Fs.unlinkSync(path)
        }
      } catch (err) {
        console.error(err)
      }
    })
  }
}

module.exports = TestUtil
