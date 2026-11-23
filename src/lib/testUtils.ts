import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** Directory of the sample PNG files, named `{size}.png`. */
export const SAMPLE_DIR = "./examples/data";

/**
 * Create image information of the sample PNG files.
 * @param sizes - Sizes of the images.
 * @returns Image information.
 */
export const sampleImages = (sizes: number[]) =>
  sizes.map((size) => ({ size, filePath: path.join(SAMPLE_DIR, `${size}.png`) }));

/**
 * Create a temporary directory for the output of a test.
 * @returns Path of the directory.
 */
export const createTempDir = (): string => fs.mkdtempSync(path.join(os.tmpdir(), "icon-gen-test-"));

/**
 * Remove a directory created by `createTempDir`.
 * @param dir - Path of the directory.
 */
export const removeTempDir = (dir: string): void =>
  fs.rmSync(dir, { recursive: true, force: true });

/**
 * Calculate the SHA-256 hash of a binary.
 * @param data - Binary.
 * @returns Hash in hexadecimal.
 */
export const sha256 = (data: Buffer): string =>
  crypto.createHash("sha256").update(data).digest("hex");
