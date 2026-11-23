import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import generateICO, { REQUIRED_IMAGE_SIZES } from "./ico.js";
import Logger from "./logger.js";
import { readPNG } from "./png.js";
import { createTempDir, removeTempDir, SAMPLE_DIR, sampleImages, sha256 } from "./testUtils.js";

/** Size of the ICO file header. */
const FILE_HEADER_SIZE = 6;

/** Size of an ICO directory entry. */
const DIRECTORY_SIZE = 16;

/** Size of the `BITMAPINFOHEADER`. */
const BITMAPINFOHEADER_SIZE = 40;

let dir = "";

beforeEach(() => {
  dir = createTempDir();
});

afterEach(() => {
  removeTempDir(dir);
});

/**
 * Convert RGBA pixels (Top/Left origin) to the BGRA pixels (Bottom/Left origin) of DIB.
 * This is intentionally written independently of the implementation under test.
 * @param rgba RGBA pixels.
 * @param size Width and height of the image.
 * @returns BGRA pixels.
 */
const toDIB = (rgba: Buffer, size: number): Buffer => {
  const dib = Buffer.alloc(rgba.length);
  for (let y = 0; y < size; ++y) {
    for (let x = 0; x < size; ++x) {
      const src = (y * size + x) * 4;
      const dest = ((size - 1 - y) * size + x) * 4;
      dib[dest] = rgba[src + 2] ?? 0;
      dib[dest + 1] = rgba[src + 1] ?? 0;
      dib[dest + 2] = rgba[src] ?? 0;
      dib[dest + 3] = rgba[src + 3] ?? 0;
    }
  }

  return dib;
};

test("generateICO: file structure and pixels", async () => {
  const filePath = await generateICO(sampleImages(REQUIRED_IMAGE_SIZES), dir, new Logger(), {});
  expect(filePath).toBe(path.join(dir, "app.ico"));

  const ico = fs.readFileSync(filePath);
  const count = REQUIRED_IMAGE_SIZES.length;

  // File header
  expect(ico.readUInt16LE(0)).toBe(0);
  expect(ico.readUInt16LE(2)).toBe(1);
  expect(ico.readUInt16LE(4)).toBe(count);

  let expectedOffset = FILE_HEADER_SIZE + DIRECTORY_SIZE * count;
  for (const [index, size] of REQUIRED_IMAGE_SIZES.entries()) {
    const pixelsSize = size * size * 4;

    // Directory entry, 256px is stored as `0`
    const entry = FILE_HEADER_SIZE + DIRECTORY_SIZE * index;
    expect(ico.readUInt8(entry)).toBe(size === 256 ? 0 : size);
    expect(ico.readUInt8(entry + 1)).toBe(size === 256 ? 0 : size);
    expect(ico.readUInt8(entry + 2)).toBe(0);
    expect(ico.readUInt8(entry + 3)).toBe(0);
    expect(ico.readUInt16LE(entry + 4)).toBe(1);
    expect(ico.readUInt16LE(entry + 6)).toBe(32);
    expect(ico.readUInt32LE(entry + 8)).toBe(BITMAPINFOHEADER_SIZE + pixelsSize);
    expect(ico.readUInt32LE(entry + 12)).toBe(expectedOffset);

    // BITMAPINFOHEADER, the height is doubled for the ICO format
    const header = expectedOffset;
    expect(ico.readUInt32LE(header)).toBe(BITMAPINFOHEADER_SIZE);
    expect(ico.readInt32LE(header + 4)).toBe(size);
    expect(ico.readInt32LE(header + 8)).toBe(size * 2);
    expect(ico.readUInt16LE(header + 12)).toBe(1);
    expect(ico.readUInt16LE(header + 14)).toBe(32);
    expect(ico.readUInt32LE(header + 16)).toBe(0);
    expect(ico.readUInt32LE(header + 20)).toBe(pixelsSize);

    // Pixels
    const begin = header + BITMAPINFOHEADER_SIZE;
    const png = await readPNG(path.join(SAMPLE_DIR, `${size}.png`));
    expect(png.width).toBe(size);
    expect(png.height).toBe(size);
    expect(ico.subarray(begin, begin + pixelsSize).equals(toDIB(png.data, size))).toBe(true);

    expectedOffset = begin + pixelsSize;
  }

  // No trailing data
  expect(ico.length).toBe(expectedOffset);
});

test("generateICO: output is identical to the one generated with pngjs", async () => {
  // The hash was recorded from the output of the previous implementation (pngjs 7.0.0)
  const filePath = await generateICO(sampleImages(REQUIRED_IMAGE_SIZES), dir, new Logger(), {});
  expect(sha256(fs.readFileSync(filePath))).toBe(
    "915b2f1a34e984d6c96bc0bfdb23fc6e9809de9e771c8af08ed934867e4e1d9c",
  );
});

test("generateICO: name and sizes options", async () => {
  const filePath = await generateICO(sampleImages(REQUIRED_IMAGE_SIZES), dir, new Logger(), {
    name: "sample",
    sizes: [16, 32],
  });
  expect(filePath).toBe(path.join(dir, "sample.ico"));

  const ico = fs.readFileSync(filePath);
  expect(ico.readUInt16LE(4)).toBe(2);
  expect(ico.readUInt8(FILE_HEADER_SIZE)).toBe(16);
  expect(ico.readUInt8(FILE_HEADER_SIZE + DIRECTORY_SIZE)).toBe(32);
});

test("generateICO: images are written in ascending order of size", async () => {
  const images = sampleImages([64, 16, 32]);
  const filePath = await generateICO(images, dir, new Logger(), {});

  const ico = fs.readFileSync(filePath);
  expect(ico.readUInt16LE(4)).toBe(3);
  expect(ico.readUInt8(FILE_HEADER_SIZE)).toBe(16);
  expect(ico.readUInt8(FILE_HEADER_SIZE + DIRECTORY_SIZE)).toBe(32);
  expect(ico.readUInt8(FILE_HEADER_SIZE + DIRECTORY_SIZE * 2)).toBe(64);
});

test("generateICO: no image matching the sizes", async () => {
  await expect(
    generateICO(sampleImages([16, 32]), dir, new Logger(), { sizes: [999] }),
  ).rejects.toThrow("There was no PNG file matching the specified size.");
  expect(fs.readdirSync(dir)).toEqual([]);
});

test("generateICO: PNG file does not exist", async () => {
  const images = [{ size: 16, filePath: path.join(dir, "not-found.png") }];
  await expect(generateICO(images, dir, new Logger(), {})).rejects.toThrow();
  expect(fs.readdirSync(dir)).toEqual([]);
});

test("generateICO: file is not a PNG", async () => {
  const filePath = path.join(dir, "16.png");
  fs.writeFileSync(filePath, "This is not a PNG file.");

  await expect(generateICO([{ size: 16, filePath }], dir, new Logger(), {})).rejects.toThrow();
  expect(fs.readdirSync(dir)).toEqual(["16.png"]);
});
