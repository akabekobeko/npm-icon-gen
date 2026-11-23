import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import generateICNS, { REQUIRED_IMAGE_SIZES } from "./icns.js";
import Logger from "./logger.js";
import { readPNG } from "./png.js";
import { createTempDir, removeTempDir, SAMPLE_DIR, sampleImages, sha256 } from "./testUtils.js";

/** Size of the ICNS file header and of an icon block header. */
const HEADER_SIZE = 8;

/** Icon block in ICNS file. */
type Block = {
  /** Type of the icon. */
  type: string;
  /** Body of the block. */
  body: Buffer;
};

let dir = "";

beforeEach(() => {
  dir = createTempDir();
});

afterEach(() => {
  removeTempDir(dir);
});

/**
 * Parse an ICNS file into icon blocks, with validation of the header and sizes.
 * @param icns - Binary of ICNS file.
 * @returns Icon blocks.
 */
const parseICNS = (icns: Buffer): Block[] => {
  expect(icns.toString("ascii", 0, 4)).toBe("icns");
  expect(icns.readUInt32BE(4)).toBe(icns.length);

  const blocks: Block[] = [];
  let pos = HEADER_SIZE;
  while (pos < icns.length) {
    const type = icns.toString("ascii", pos, pos + 4);
    const size = icns.readUInt32BE(pos + 4);
    expect(size).toBeGreaterThan(HEADER_SIZE);
    expect(pos + size).toBeLessThanOrEqual(icns.length);

    blocks.push({ type, body: icns.subarray(pos + HEADER_SIZE, pos + size) });
    pos += size;
  }

  expect(pos).toBe(icns.length);
  return blocks;
};

/**
 * Decompress the ICNS RLE.
 * This is intentionally written independently of the implementation under test.
 * @param src - Compressed binary.
 * @returns Decompressed binary.
 * @see https://en.wikipedia.org/wiki/Apple_Icon_Image_format#Compression
 */
const unpackICNS = (src: Buffer): number[] => {
  const dest: number[] = [];
  for (let pos = 0; pos < src.length; ) {
    const control = src[pos++] ?? 0;
    if (control < 128) {
      // Literal bytes
      for (let i = 0; i < control + 1; ++i) {
        dest.push(src[pos++] ?? 0);
      }
    } else {
      // Repeated byte
      const value = src[pos++] ?? 0;
      for (let i = 0; i < control - 125; ++i) {
        dest.push(value);
      }
    }
  }

  return dest;
};

/**
 * Find an icon block by type.
 * @param blocks - Icon blocks.
 * @param type - Type of the icon.
 * @returns Body of the block.
 */
const bodyOf = (blocks: Block[], type: string): Buffer => {
  const block = blocks.find((b) => b.type === type);
  if (!block) {
    throw new Error(`"${type}" block is not found.`);
  }

  return block.body;
};

test("generateICNS: file structure and images", async () => {
  const filePath = await generateICNS(sampleImages(REQUIRED_IMAGE_SIZES), dir, new Logger(), {});
  expect(filePath).toBe(path.join(dir, "app.icns"));

  const blocks = parseICNS(fs.readFileSync(filePath));
  expect(blocks.map((block) => block.type)).toEqual([
    "ic07",
    "ic08",
    "ic09",
    "ic10",
    "ic11",
    "ic12",
    "ic13",
    "ic14",
    "is32",
    "s8mk",
    "il32",
    "l8mk",
  ]);

  // PNG blocks hold the PNG file as it is
  const pngBlocks: [string, number][] = [
    ["ic07", 128],
    ["ic08", 256],
    ["ic09", 512],
    ["ic10", 1024],
    ["ic11", 32],
    ["ic12", 64],
    ["ic13", 256],
    ["ic14", 512],
  ];
  for (const [type, size] of pngBlocks) {
    const png = fs.readFileSync(path.join(SAMPLE_DIR, `${size}.png`));
    expect(bodyOf(blocks, type).equals(png)).toBe(true);
  }

  // PackBits blocks hold the R, G and B channels compressed in this order, and the alpha as a mask
  const packBitsBlocks: [string, string, number][] = [
    ["is32", "s8mk", 16],
    ["il32", "l8mk", 32],
  ];
  for (const [type, mask, size] of packBitsBlocks) {
    const png = await readPNG(path.join(SAMPLE_DIR, `${size}.png`));
    const pixels = size * size;
    const channel = (offset: number) =>
      Array.from({ length: pixels }, (_, i) => png.data[i * 4 + offset]);

    const colors = unpackICNS(bodyOf(blocks, type));
    expect(colors.length).toBe(pixels * 3);
    expect(colors.slice(0, pixels)).toEqual(channel(0));
    expect(colors.slice(pixels, pixels * 2)).toEqual(channel(1));
    expect(colors.slice(pixels * 2)).toEqual(channel(2));
    expect(Array.from(bodyOf(blocks, mask))).toEqual(channel(3));
  }
});

test("generateICNS: output is identical to the one generated with pngjs", async () => {
  // The hash was recorded from the output of the previous implementation (pngjs 7.0.0)
  const filePath = await generateICNS(sampleImages(REQUIRED_IMAGE_SIZES), dir, new Logger(), {});
  expect(sha256(fs.readFileSync(filePath))).toBe(
    "166f7a914a1b1aa06cf170552eebddde780891ed592a26520a9207ad90530dde",
  );
});

test("generateICNS: name and sizes options", async () => {
  const filePath = await generateICNS(sampleImages(REQUIRED_IMAGE_SIZES), dir, new Logger(), {
    name: "sample",
    sizes: [16, 128],
  });
  expect(filePath).toBe(path.join(dir, "sample.icns"));

  const blocks = parseICNS(fs.readFileSync(filePath));
  expect(blocks.map((block) => block.type)).toEqual(["ic07", "is32", "s8mk"]);
});

test("generateICNS: empty name and sizes fall back to the defaults", async () => {
  const filePath = await generateICNS(sampleImages(REQUIRED_IMAGE_SIZES), dir, new Logger(), {
    name: "",
    sizes: [],
  });
  expect(filePath).toBe(path.join(dir, "app.icns"));
  expect(parseICNS(fs.readFileSync(filePath)).length).toBe(12);
});

test("generateICNS: no image matching the sizes", async () => {
  await expect(
    generateICNS(sampleImages([16, 32]), dir, new Logger(), { sizes: [999] }),
  ).rejects.toThrow("Failed to create the body of the file. The size is `0`.");
  expect(fs.readdirSync(dir)).toEqual([]);
});

test("generateICNS: file is not a PNG", async () => {
  const filePath = path.join(dir, "16.png");
  fs.writeFileSync(filePath, "This is not a PNG file.");

  await expect(generateICNS([{ size: 16, filePath }], dir, new Logger(), {})).rejects.toThrow();
  expect(fs.readdirSync(dir)).toEqual(["16.png"]);
});
