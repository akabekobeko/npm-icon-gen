import Fs from 'fs'
import Path from 'path'
import OS from 'os'
import UUID from 'uuid'
import { ImageInfo } from './png-generator'

/**
 * Create the work directory.
 * @return The path of the created directory.
 * @throws Failed to create directory.
 */
export const createWorkDir = (): string => {
  const dir = Path.join(OS.tmpdir(), UUID.v4())
  Fs.mkdirSync(dir)
  if (!Fs.existsSync(dir)) {
    throw new Error('Failed to create directory.')
  }

  return dir
}

/**
 * Delete a files.
 * @param paths File paths.
 */
export const deleteFiles = (paths: string[]) => {
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
 * @param images Image file informations.
 * @param sizes  Required sizes.
 * @return Filtered image informations.
 */
export const filterImagesBySizes = (images: ImageInfo[], sizes: number[]) => {
  return images
    .filter((image) => {
      return sizes.some((size) => {
        return image.size === size
      })
    })
    .sort((a, b) => {
      return a.size - b.size
    })
}
