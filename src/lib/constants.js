'use strict'

/**
 * size required for the FAVICON.
 * @type {Object}
 */
const Favicon = {
  /**
   * Sizes required for the FAVICON PNG files.
   * @type {Array.<Number>}
   */
  imageSizes: [32, 57, 72, 96, 120, 128, 144, 152, 195, 228],

  /**
   * Sizes required for the FAVICON ICO file.
   * @type {Array.<Number>}
   */
  icoImageSizes: [16, 24, 32, 48, 64],

  /**
   * File name of the FAVICON file.
   * @type {String}
   */
  icoFileName: 'favicon.ico',

  /**
   * Collection of the file name and size of the icon.
   * @type {Array.<Object>}
   * @see https://github.com/audreyr/favicon-cheat-sheet
   */
  pngFiles: [
    {name: 'favicon-32.png',  size: 32},  // Certain old but not too old Chrome versions mishandle ico
    {name: 'favicon-57.png',  size: 57},  // Standard iOS home screen (iPod Touch, iPhone first generation to 3G)
    {name: 'favicon-72.png',  size: 72},  // iPad home screen icon
    {name: 'favicon-96.png',  size: 96},  // GoogleTV icon
    {name: 'favicon-120.png', size: 120}, // iPhone retina touch icon (Change for iOS 7: up = require(114x114)
    {name: 'favicon-128.png', size: 128}, // Chrome Web Store icon
    {name: 'favicon-144.png', size: 144}, // IE10 Metro tile for pinned site
    {name: 'favicon-152.png', size: 152}, // iPad retina touch icon (Change for iOS 7: up = require(144x144)
    {name: 'favicon-195.png', size: 195}, // Opera Speed Dial icon
    {name: 'favicon-228.png', size: 228}  // Opera Coast icon
  ]
}

/**
 * It defines constants for the ICNS.
 * @type {Object}
 */
const ICNS = {
  /**
   * Sizes required for the ICNS file.
   * @type {Array}
   */
  imageSizes: [16, 32, 64, 128, 256, 512, 1024],

  /**
   * The size of the ICNS header.
   * @type {Number}
   */
  headerSize: 8,

  /**
   * Identifier of the ICNS file, in ASCII "icns".
   * @type {Number}
   */
  fileID: 'icns',

  /**
   * Identifier of the images, Mac OS 8.x (il32, is32, l8mk, s8mk) is unsupported.
   * @type {Array}
   */
  iconIDs: [
    {id: 'icp4', size: 16},
    {id: 'icp5', size: 32},
    {id: 'icp6', size: 64},
    {id: 'ic07', size: 128},
    {id: 'ic08', size: 256},
    {id: 'ic09', size: 512},
    {id: 'ic10', size: 1024}
  ]
}

/**
 * It defines constants for the ICO.
 * @type {Object}
 */
const ICO = {
  /**
   * Sizes required for the ICO file.
   * @type {Array}
   */
  imageSizes: [16, 24, 32, 48, 64, 128, 256],

  /**
   * Size of the file header.
   * @type {Number}
   */
  headerSize: 6,

  /**
   * Size of the icon directory.
   * @type {Number}
   */
  directorySize: 16,

  /**
   * Size of the BITMAPINFOHEADER.
   * @type {Number}
   */
  BitmapInfoHeaderSize: 40,

  /**
   * Color mode.
   * @type {Number}
   */
  BI_RGB: 0
}

module.exports = {
  Favicon: Favicon,
  ICNS: ICNS,
  ICO: ICO
}
