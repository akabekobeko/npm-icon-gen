import Fs from 'fs'
import Path from 'path'
import OS from 'os'
import UUID from 'uuid'

export default class Util {
  /**
   * Create the work directory.
   *
   * @return {String} The path of the created directory, failure is null.
   */
  static createWorkDir () {
    const dir = Path.join(OS.tmpdir(), UUID.v4())
    Fs.mkdirSync(dir)

    const stat = Fs.statSync(dir)
    return (stat && stat.isDirectory() ? dir : null)
  }

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

  /**
   * Filter by size to the specified image informations.
   *
   * @param {Array.<ImageInfo>} images Image file informations.
   * @param {Array.<Number>}    sizes  Required sizes.
   *
   * @return {Array.<ImageInfo>} Filtered image informations.
   */
  static filterImagesBySizes (images, sizes) {
    return images
      .filter((image) => {
        return sizes.some((size) => {
          return (image.size === size)
        })
      })
      .sort((a, b) => {
        return (a.size - b.size)
      })
  }

  /**
   * Convert a values to a flat array.
   *
   * @param  {Array.<String|Array>} values Values ([ 'A', 'B', [ 'C', 'D' ] ]).
   *
   * @return {Array.<String>} Flat array ([ 'A', 'B', 'C', 'D' ]).
   */
  static flattenValues (values) {
    const paths = []
    values.forEach((value) => {
      if (!(value)) {
        return
      }

      if (Array.isArray(value)) {
        value.forEach((path) => {
          paths.push(path)
        })
      } else {
        paths.push(value)
      }
    })

    return paths
  }
}
