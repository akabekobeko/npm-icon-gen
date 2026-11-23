import fs from "node:fs";
import path from "node:path";
import sharp, { type Sharp } from "sharp";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { REQUIRED_IMAGE_SIZES as FAV_SIZES } from "./favicon.js";
import { REQUIRED_IMAGE_SIZES as ICNS_SIZES } from "./icns.js";
import { REQUIRED_IMAGE_SIZES as ICO_SIZES } from "./ico.js";
import Logger from "./logger.js";
import generatePNG, { filterImagesBySizes, readPNG } from "./png.js";
import { createTempDir, removeTempDir, SAMPLE_DIR } from "./testUtils.js";

test("generatePNG", () => {
  const dir = fs.mkdtempSync("icon-gen-");

  return generatePNG("./examples/data/sample.svg", dir, [16], new Logger())
    .then((results) => {
      expect(results[0]?.size).toBe(16);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      fs.rmSync(dir, { recursive: true, force: true });
    });
});

// Test data
const targets = ICO_SIZES.concat(ICNS_SIZES)
  .concat(FAV_SIZES)
  .filter((value, index, array) => array.indexOf(value) === index)
  .sort((a, b) => a - b)
  .map((size) => ({ size, filePath: "" }));

test("filterImagesBySizes: ICO", () => {
  const sizes = filterImagesBySizes(targets, ICO_SIZES);
  expect(sizes.length).toBe(ICO_SIZES.length);
});

test("filterImagesBySizes: ICNS", () => {
  const sizes = filterImagesBySizes(targets, ICNS_SIZES);
  expect(sizes.length).toBe(ICNS_SIZES.length);
});

test("filterImagesBySizes: Favicon", () => {
  const sizes = filterImagesBySizes(targets, FAV_SIZES);
  expect(sizes.length).toBe(FAV_SIZES.length);
});

describe("readPNG", () => {
  /** Width of the test image. */
  const WIDTH = 4;

  /** Height of the test image. */
  const HEIGHT = 2;

  /** RGBA pixels with various colors and alpha values. */
  const COLOR_PIXELS = [
    [255, 0, 0, 255],
    [0, 255, 0, 128],
    [0, 0, 255, 1],
    [10, 20, 30, 40],
    [255, 255, 255, 255],
    [0, 0, 0, 255],
    [128, 128, 128, 200],
    [1, 2, 3, 4],
  ].flat();

  /** RGBA pixels of grayscale (R = G = B) with various alpha values. */
  const GRAY_PIXELS = [
    [0, 0, 0, 255],
    [255, 255, 255, 128],
    [1, 1, 1, 1],
    [127, 127, 127, 40],
    [128, 128, 128, 255],
    [254, 254, 254, 254],
    [64, 64, 64, 200],
    [200, 200, 200, 4],
  ].flat();

  /** Expected metadata of the encoded PNG file. */
  type Format = {
    /** Number of channels. */
    channels: number;
    /** Bit depth. */
    depth: string;
    /** `true` if the image is palette-based. */
    isPalette: boolean;
    /** `true` if the image is interlaced. */
    isProgressive: boolean;
  };

  let dir = "";

  beforeEach(() => {
    dir = createTempDir();
  });

  afterEach(() => {
    removeTempDir(dir);
  });

  /**
   * Replace the alpha of all pixels with opaque.
   * @param pixels RGBA pixels.
   * @returns Opaque RGBA pixels.
   */
  const opaque = (pixels: number[]) => pixels.map((value, i) => (i % 4 === 3 ? 255 : value));

  /**
   * Encode pixels to a PNG file, and check that the file has the intended format.
   * @param pixels RGBA pixels.
   * @param encode Function to encode the image to the PNG of the target format.
   * @param format Expected format of the PNG file.
   * @returns Path of the PNG file.
   */
  const writePNG = async (
    pixels: number[],
    encode: (image: Sharp) => Sharp,
    format: Format,
  ): Promise<string> => {
    const filePath = path.join(dir, "test.png");
    const image = sharp(Buffer.from(pixels), {
      raw: { width: WIDTH, height: HEIGHT, channels: 4 },
    });
    await encode(image).toFile(filePath);

    const { channels, depth, isPalette, isProgressive } = await sharp(filePath).metadata();
    expect({ channels, depth, isPalette, isProgressive }).toEqual(format);

    return filePath;
  };

  /** Format of 8bit RGBA, the others are described as a difference from this. */
  const RGBA8: Format = { channels: 4, depth: "uchar", isPalette: false, isProgressive: false };

  test.each<[string, number[], (image: Sharp) => Sharp, Format, number[]]>([
    ["RGBA 8bit", COLOR_PIXELS, (image) => image.png(), RGBA8, COLOR_PIXELS],
    [
      "RGB 8bit without alpha",
      COLOR_PIXELS,
      (image) => image.removeAlpha().png(),
      { ...RGBA8, channels: 3 },
      opaque(COLOR_PIXELS),
    ],
    [
      "RGBA 16bit",
      COLOR_PIXELS,
      (image) => image.toColourspace("rgb16").png(),
      { ...RGBA8, depth: "ushort" },
      COLOR_PIXELS,
    ],
    [
      "palette with alpha",
      COLOR_PIXELS,
      (image) => image.png({ palette: true }),
      { ...RGBA8, isPalette: true },
      COLOR_PIXELS,
    ],
    [
      "palette without alpha",
      COLOR_PIXELS,
      (image) => image.removeAlpha().png({ palette: true }),
      { ...RGBA8, channels: 3, isPalette: true },
      opaque(COLOR_PIXELS),
    ],
    [
      "interlaced",
      COLOR_PIXELS,
      (image) => image.png({ progressive: true }),
      { ...RGBA8, isProgressive: true },
      COLOR_PIXELS,
    ],
    [
      "grayscale 8bit",
      GRAY_PIXELS,
      (image) => image.removeAlpha().toColourspace("b-w").png(),
      { ...RGBA8, channels: 1 },
      opaque(GRAY_PIXELS),
    ],
    [
      "grayscale 8bit with alpha",
      GRAY_PIXELS,
      (image) => image.toColourspace("b-w").png(),
      { ...RGBA8, channels: 2 },
      GRAY_PIXELS,
    ],
    [
      "grayscale 16bit",
      GRAY_PIXELS,
      (image) => image.removeAlpha().toColourspace("grey16").png(),
      { ...RGBA8, channels: 1, depth: "ushort" },
      opaque(GRAY_PIXELS),
    ],
  ])("%s is decoded to 8bit RGBA", async (_name, pixels, encode, format, expected) => {
    const png = await readPNG(await writePNG(pixels, encode, format));
    expect(png.width).toBe(WIDTH);
    expect(png.height).toBe(HEIGHT);
    expect(Array.from(png.data)).toEqual(expected);
  });

  test.each([16, 24, 256, 1024])("sample %ipx", async (size) => {
    const png = await readPNG(path.join(SAMPLE_DIR, `${size}.png`));
    expect(png.width).toBe(size);
    expect(png.height).toBe(size);
    expect(png.data.length).toBe(size * size * 4);
  });

  test("file does not exist", async () => {
    await expect(readPNG(path.join(dir, "not-found.png"))).rejects.toThrow();
  });

  test("file is not a PNG", async () => {
    const filePath = path.join(dir, "test.png");
    fs.writeFileSync(filePath, "This is not a PNG file.");
    await expect(readPNG(filePath)).rejects.toThrow();
  });
});
