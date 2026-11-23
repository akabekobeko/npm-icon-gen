import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import generateIcon from "./index.js";
import { createTempDir, removeTempDir, SAMPLE_DIR, sha256 } from "./testUtils.js";

/** Names of the files generated with the default settings. */
const DEFAULT_FILE_NAMES = [
  "app.icns",
  "app.ico",
  "favicon-120.png",
  "favicon-128.png",
  "favicon-144.png",
  "favicon-152.png",
  "favicon-195.png",
  "favicon-228.png",
  "favicon-32.png",
  "favicon-57.png",
  "favicon-72.png",
  "favicon-96.png",
  "favicon.ico",
];

let dir = "";

beforeEach(() => {
  dir = createTempDir();
});

afterEach(() => {
  removeTempDir(dir);
});

test("generateIcon: from PNG directory, output is identical to the one generated with pngjs", async () => {
  const results = await generateIcon(SAMPLE_DIR, dir, { report: false });
  expect(results.map((result) => path.basename(result)).sort()).toEqual(DEFAULT_FILE_NAMES);
  expect(fs.readdirSync(dir).sort()).toEqual(DEFAULT_FILE_NAMES);

  // The hashes were recorded from the output of the previous implementation (pngjs 7.0.0)
  const hashes = {
    "app.icns": "166f7a914a1b1aa06cf170552eebddde780891ed592a26520a9207ad90530dde",
    "app.ico": "915b2f1a34e984d6c96bc0bfdb23fc6e9809de9e771c8af08ed934867e4e1d9c",
    "favicon.ico": "c2c23fd6ce0755a9e154d308d5d82d97223d690be3d637acd6ec6a0a11e18c19",
  };
  for (const [name, hash] of Object.entries(hashes)) {
    expect(sha256(fs.readFileSync(path.join(dir, name)))).toBe(hash);
  }

  // Favicon PNG is a copy of the source file
  for (const size of [32, 57, 72, 96, 120, 128, 144, 152, 195, 228]) {
    const src = fs.readFileSync(path.join(SAMPLE_DIR, `${size}.png`));
    const dest = fs.readFileSync(path.join(dir, `favicon-${size}.png`));
    expect(dest.equals(src)).toBe(true);
  }
});

test("generateIcon: from SVG file", async () => {
  const results = await generateIcon(path.join(SAMPLE_DIR, "sample.svg"), dir, { report: false });
  expect(results.map((result) => path.basename(result)).sort()).toEqual(DEFAULT_FILE_NAMES);

  // ICO: 7 images
  const ico = fs.readFileSync(path.join(dir, "app.ico"));
  expect(ico.readUInt16LE(2)).toBe(1);
  expect(ico.readUInt16LE(4)).toBe(7);

  // ICNS: the size in the header matches the file size
  const icns = fs.readFileSync(path.join(dir, "app.icns"));
  expect(icns.toString("ascii", 0, 4)).toBe("icns");
  expect(icns.readUInt32BE(4)).toBe(icns.length);
});

test("generateIcon: only the specified icon is generated", async () => {
  const results = await generateIcon(SAMPLE_DIR, dir, { report: false, ico: { name: "sample" } });
  expect(results).toEqual([path.join(dir, "sample.ico")]);
  expect(fs.readdirSync(dir)).toEqual(["sample.ico"]);
});

test("generateIcon: input is not found", async () => {
  await expect(generateIcon(path.join(dir, "not-found"), dir)).rejects.toThrow(
    "Input file or directory is not found.",
  );
});

test("generateIcon: output directory is not found", async () => {
  await expect(generateIcon(SAMPLE_DIR, path.join(dir, "not-found"))).rejects.toThrow(
    "Output directory is not found.",
  );
});
