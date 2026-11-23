import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type Logger from "./logger.js";

/** Image file information. */
export type ImageInfo = {
  /** Image size (width/height). */
  size: number;
  /** Path of an image file. */
  filePath: string;
};

/** Decoded PNG image. */
export type RawImage = {
  /** Pixels in 8bit RGBA, the coordinate structure is the Top/Left to Bottom/Right. */
  data: Buffer;
  /** Width of the image in pixels. */
  width: number;
  /** Height of the image in pixels. */
  height: number;
};

/**
 * Decode a PNG file to 8bit RGBA pixels.
 * Regardless of the color type (palette, grayscale, without alpha) and the bit depth of the file,
 * the result is always normalized to 4 channels of 8bit.
 * @param filePath - Path of a PNG file.
 * @returns Decoded image.
 */
export const readPNG = async (filePath: string): Promise<RawImage> => {
  // sharp outputs 8bit sRGB by default, so only the alpha channel has to be added explicitly
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return { data, width: info.width, height: info.height };
};

/**
 * Filter by size to the specified image information.
 * @param images - Image file information.
 * @param sizes - Required sizes.
 * @returns Filtered image information.
 */
export const filterImagesBySizes = (images: ImageInfo[], sizes: number[]) =>
  images
    .filter((image) => sizes.some((size) => image.size === size))
    .sort((a, b) => a.size - b.size);

/**
 * Generate the PNG file.
 * @param svg - SVG data that has been parse by svg2png.
 * @param size - The size (width/height) of the image.
 * @param dir - Path of the file output directory.
 * @param logger - Logger.
 * @returns Image generation task.
 */
const generate = async (
  svg: Buffer,
  size: number,
  dir: string,
  logger: Logger,
): Promise<ImageInfo> => {
  const dest = path.join(dir, `${size}.png`);
  logger.log(`  Create: ${dest}`);

  await sharp(svg)
    .png({ compressionLevel: 9 })
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toFile(dest);

  return { size: size, filePath: dest };
};

/**
 * Generate the PNG files.
 * @param src - Path of SVG file.
 * @param dir - Output destination The path of directory.
 * @param sizes - Required PNG image size.
 * @param logger - Logger.
 */
export const generatePNG = async (
  src: string,
  dir: string,
  sizes: number[],
  logger: Logger,
): Promise<ImageInfo[]> => {
  logger.log("SVG to PNG:");

  const svg = fs.readFileSync(src);
  const images: ImageInfo[] = [];
  for (const size of sizes) {
    images.push(await generate(svg, size, dir, logger));
  }

  return images;
};

export default generatePNG;
