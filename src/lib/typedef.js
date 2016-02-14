/**
 * @external {Buffer} https://nodejs.org/api/buffer.html
 */

/**
 * @external {WritableStream} https://nodejs.org/api/stream.html
 */

/**
 * Image file infromations.
 *
 * @typedef {Object} ImageInfo
 * @property {Number} size Image size ( width/height ).
 * @property {String} path File path.
 */

 /**
  * Header information of the ICO file.
  *
  * @typedef {Object} ICOHeader
  * @property {Number} reserved 2 bytes. Reserved. Must always be 0.
  * @property {Number} type     2 bytes. Specifies image type: 1 for icon (.ICO) image, 2 for cursor (.CUR) image. Other values are invalid.
  * @property {Number} counr    2 bytes. Specifies number of images in the file.
  *
  * @see https://en.wikipedia.org/wiki/ICO_%28file_format%29
  */

  /**
   * Directory information of the ICO file.
   *
   * @typedef {Object} ICODirectory
   * @property {Number} width    1 bytes. Specifies image width in pixels. Can be any number between 0 and 255. Value 0 means image width is 256 pixels.
   * @property {Number} height   1 bytes. Specifies image height in pixels. Can be any number between 0 and 255. Value 0 means image height is 256 pixels.
   * @property {Number} colors   1 bytes. Specifies number of colors in the color palette. Should be 0 if the image does not use a color palette.
   * @property {Number} reserved 1 bytes. Reserved. Should be 0.
   * @property {Number} planes   2 bytes. In ICO format: Specifies color planes. Should be 0 or 1. In CUR format: Specifies the horizontal coordinates of the hotspot in number of pixels from the left.
   * @property {Number} bpp        2 bytes. In ICO format: Specifies bits per pixel. In CUR format: Specifies the vertical coordinates of the hotspot in number of pixels from the top.
   * @property {Number} size     4 bytes. Specifies the size of the image's data in bytes.
   * @property {Number} offset   4 bytes. Specifies the offset of BMP or PNG data from the beginning of the ICO/CUR file.
   *
   * @see https://en.wikipedia.org/wiki/ICO_%28file_format%29
   */
