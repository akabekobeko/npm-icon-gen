/** Max length of PackBits literal. */
const MAX_LITERAL_LENGTH = 127

/**
 * Copies the array to the target array at the specified position and size.
 * @param src Byte array of copy source.
 * @param srcBegin  Copying start position of source.
 * @param dest Byte array of copy destination.
 * @param destBegin Writing start position of destination.
 * @param size Size of copy bytes.
 */
const arrayCopy = (
  src: number[],
  srcBegin: number,
  dest: number[],
  destBegin: number,
  size: number
) => {
  if (
    src.length <= srcBegin ||
    src.length < size ||
    dest.length <= destBegin ||
    dest.length < size
  ) {
    return
  }

  for (let i = srcBegin, j = destBegin, k = 0; k < size; ++i, ++j, ++k) {
    dest[j] = src[i]
  }
}

/**
 * Convert a 8bit signed value to unsigned value.
 * @param value 8bit signed value (-127 to 127)
 * @return Unsigned value (0 to 255).
 */
const toUInt8 = (value: number) => {
  return value & 0xff
}

/**
 * Convert a 8bit unsigned value to signed value.
 * @param value 8bit unsigned value (0 to 255).
 * @return Signed value (-127 to 127).
 * @see https://github.com/inexorabletash/polyfill/blob/master/typedarray.js
 */
const toInt8 = (value: number) => {
  return (value << 24) >> 24
}

/**
 * Convert PackBits literals to results.
 * @param literals PackBits literals.
 * @return Converted literals.
 */
export const packBitsLiteralToResult = (literals: number[]) => {
  return literals.length === 0
    ? []
    : [toUInt8(literals.length - 1)].concat(literals)
}

/**
 * Decompress PackBits compressed binary.
 * This method port Geeks with Blogs code (Apache License v2.0) to Node.
 * @param src Source binary.
 * @return Decompressed binary.
 * @see https://en.wikipedia.org/wiki/PackBits
 * @see http://geekswithblogs.net/rakker/archive/2015/12/14/packbits-in-c.aspx
 */
export const unpackBits = (src: number[]) => {
  const dest = []
  for (let i = 0, max = src.length; i < max; ++i) {
    const count = toInt8(toUInt8(src[i]))
    if (count === -128) {
      // Do nothing, skip it
    } else if (0 <= count) {
      const total = count + 1
      for (let j = 0; j < total; ++j) {
        dest.push(toUInt8(src[i + j + 1]))
      }

      i += total
    } else {
      const total = Math.abs(count) + 1
      for (let j = 0; j < total; ++j) {
        dest.push(toUInt8(src[i + 1]))
      }

      ++i
    }
  }

  return dest
}

/**
 * Compress binary with ICNS RLE.
 * @param src Source binary.
 * @return Compressed binary.
 * @see https://github.com/fiji/IO/blob/master/src/main/java/sc/fiji/io/icns/RunLengthEncoding.java
 */
export const packICNS = (src: number[]) => {
  // If it is not redundant, keep the size large enough to increase the size
  const packedData = new Array(src.length * 2).fill(0)

  let output = 0
  for (let input = 0; input < src.length; ) {
    let literalStart = input
    let currentData = src[input++]

    // Read up to 128 literal bytes
    // Stop if 3 or more consecutive bytes are equal or EOF is reached
    let readBytes = 1
    let repeatedBytes = 0
    while (input < src.length && readBytes < 128 && repeatedBytes < 3) {
      const nextData = src[input++]
      if (nextData === currentData) {
        if (repeatedBytes === 0) {
          repeatedBytes = 2
        } else {
          repeatedBytes++
        }
      } else {
        repeatedBytes = 0
      }

      readBytes++
      currentData = nextData
    }

    let literalBytes = 0
    if (repeatedBytes < 3) {
      literalBytes = readBytes
      repeatedBytes = 0
    } else {
      literalBytes = readBytes - repeatedBytes
    }

    // Write the literal bytes that were read
    if (0 < literalBytes) {
      packedData[output++] = toUInt8(literalBytes - 1)
      arrayCopy(src, literalStart, packedData, output, literalBytes)
      output += literalBytes
    }

    // Read up to 130 consecutive bytes that are equal
    while (
      input < src.length &&
      src[input] === currentData &&
      repeatedBytes < 130
    ) {
      repeatedBytes++
      input++
    }

    if (3 <= repeatedBytes) {
      // Write the repeated bytes if there are 3 or more
      packedData[output++] = toUInt8(repeatedBytes + 125)
      packedData[output++] = currentData
    } else {
      // Else move back the in pointer to ensure the repeated bytes are included in the next literal string
      input -= repeatedBytes
    }
  }

  // Trim to the actual size
  const dest = new Array(output).fill(0)
  arrayCopy(packedData, 0, dest, 0, output)

  return dest
}

/**
 * Compress binary with PackBits.
 * This method port Geeks with Blogs code (Apache License v2.0) to Node.
 * @param src Source binary.
 * @return Compressed binary.
 * @see https://en.wikipedia.org/wiki/PackBits
 * @see http://geekswithblogs.net/rakker/archive/2015/12/14/packbits-in-c.aspx
 */
export const packBits = (src: number[]) => {
  if (!(src && src.length && 0 < src.length)) {
    return []
  }

  let dest: number[] = []
  let literals = []

  for (let i = 0, max = src.length; i < max; ++i) {
    const current = toUInt8(src[i])
    if (i + 1 < max) {
      const next = toUInt8(src[i + 1])
      if (current === next) {
        dest = dest.concat(packBitsLiteralToResult(literals))
        literals = []

        const maxJ =
          max <= i + MAX_LITERAL_LENGTH ? max - i - 1 : MAX_LITERAL_LENGTH
        let hitMax = true
        let runLength = 1

        for (let j = 2; j <= maxJ; ++j) {
          const run = src[i + j]
          if (current !== run) {
            hitMax = false
            const count = toUInt8(0 - runLength)
            i += j - 1
            dest.push(count)
            dest.push(current)
            break
          }

          ++runLength
        }

        if (hitMax) {
          dest.push(toUInt8(0 - maxJ))
          dest.push(current)
          i += maxJ
        }
      } else {
        literals.push(current)
        if (literals.length === MAX_LITERAL_LENGTH) {
          dest = dest.concat(packBitsLiteralToResult(literals))
          literals = []
        }
      }
    } else {
      literals.push(current)
      dest = dest.concat(packBitsLiteralToResult(literals))
      literals = []
    }
  }

  return dest
}
