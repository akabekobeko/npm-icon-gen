
/**
 * Bitmap constants.
 * @type {Object}
 */
export const BitmapConstants = {
  /**
   * Size of BITMAPINFOHEADER.
   * @type {Number}
   */
  BI_SIZE: 40,

  /**
   * An uncompressed format.
   * @type {Number}
   */
  BI_RGB: 0,

  /**
   * A run-length encoded (RLE) format for bitmaps with 8 bpp. The compression format is a 2-byte format consisting of a count byte followed by a byte containing a color index. For more information.
   * @type {Number}
   * @see https://msdn.microsoft.com/ja-jp/library/windows/desktop/dd183383%28v=vs.85%29.aspx
   */
  BI_RLE8: 1,

  /**
   * An RLE format for bitmaps with 4 bpp. The compression format is a 2-byte format consisting of a count byte followed by two word-length color indexes. For more information.
   * @type {Number}
   * @see https://msdn.microsoft.com/ja-jp/library/windows/desktop/dd183383%28v=vs.85%29.aspx
   */
  BI_RLE4: 2,

  /**
   * Specifies that the bitmap is not compressed and that the color table consists of three DWORD color masks that specify the red, green, and blue components, respectively, of each pixel. This is valid when used with 16- and 32-bpp bitmaps.
   * @type {Number}
   */
  BI_BITFIELDS: 3,

  /**
   * Indicates that the image is a JPEG image.
   * @type {Number}
   */
  BI_JPEG: 4,

  /**
   * Indicates that the image is a PNG image.
   * @type {Number}
   */
  BI_PNG: 5
};

/**
 * The BITMAPINFOHEADER structure contains information about the dimensions and color format of a DIB.
 *
 * @see https://msdn.microsoft.com/ja-jp/library/windows/desktop/dd183376%28v=vs.85%29.aspx
 */
export default class BitmapInfoHeader {
  /**
   * Initialize instance.
   */
  constructor() {
    /**
     * The width of the bitmap, in pixels.
     *
     * If biCompression is BI_JPEG or BI_PNG, the biWidth member specifies the width of the decompressed JPEG or PNG image file, respectively.
     * 4 byte ( signed )
     * @type {Number}
     */
    this.width = 0;

    /**
     * The height of the bitmap, in pixels. If biHeight is positive, the bitmap is a bottom-up DIB and its origin is the lower-left corner. If biHeight is negative, the bitmap is a top-down DIB and its origin is the upper-left corner.
     *
     * If biHeight is negative, indicating a top-down DIB, biCompression must be either BI_RGB or BI_BITFIELDS. Top-down DIBs cannot be compressed.
     *
     * If biCompression is BI_JPEG or BI_PNG, the biHeight member specifies the height of the decompressed JPEG or PNG image file, respectively.
     *
     * 4 byte ( signed )
     * @type {Number}
     */
    this.height = 0;

    /**
     * The number of planes for the target device. This value must be set to 1.
     * 2 byte ( unsigned )
     * @type {Number}
     */
    this.planes = 1;

    /**
     * The number of bits-per-pixel. The biBitCount member of the BITMAPINFOHEADER structure determines the number of bits that define each pixel and the maximum number of colors ( 0, 1, 4, 8, 16, 24, 32 ) in the bitmap.
     * 2 byte ( unsigned )
     * @type {Number}
     */
    this.bitCount = 0;

    /**
     * The type of compression for a compressed bottom-up bitmap ( top-down DIBs cannot be compressed ).
     * 4 byte ( unsigned ).
     * @type {Number}
     */
    this.compression = BitmapConstants.BI_RGB;

    /**
     * The size, in bytes, of the image. This may be set to zero for BI_RGB bitmaps.
     * If biCompression is BI_JPEG or BI_PNG, biSizeImage indicates the size of the JPEG or PNG image buffer, respectively.
     * 4 byte ( unsigned ).
     * @type {Number}
     */
    this.imageSize = 0;

    /**
     * The horizontal resolution, in pixels-per-meter, of the target device for the bitmap. An application can use this value to select a bitmap from a resource group that best matches the characteristics of the current device.
     * 4 byte ( signed )
     * @type {Number}
     */
    this.pixcelsMeterX = 0;

    /**
     * The vertical resolution, in pixels-per-meter, of the target device for the bitmap.
     * 4 byte ( signed )
     * @type {Number}
     */
    this.pixcelsMeterY = 0;

    /**
     * The number of color indexes in the color table that are actually used by the bitmap. If this value is zero, the bitmap uses the maximum number of colors corresponding to the value of the biBitCount member for the compression mode specified by biCompression.
     *
     * If biClrUsed is nonzero and the biBitCount member is less than 16, the biClrUsed member specifies the actual number of colors the graphics engine or device driver accesses. If biBitCount is 16 or greater, the biClrUsed member specifies the size of the color table used to optimize performance of the system color palettes. If biBitCount equals 16 or 32, the optimal color palette starts immediately following the three DWORD masks.
     *
     * When the bitmap array immediately follows the BITMAPINFO structure, it is a packed bitmap. Packed bitmaps are referenced by a single pointer. Packed bitmaps require that the biClrUsed member must be either zero or the actual size of the color table.
     * 4 byte ( unsigned ).
     * @type {Number}
     */
    this.colorUsed = 0;

    /**
     * The number of color indexes that are required for displaying the bitmap. If this value is zero, all colors are required.
     * 4 byte ( unsigned ).
     * @type {Number}
     */
    this.colorImportant = 0;
  }

  /**
   * The number of bytes required by the structure.
   * @return {Number} Size.
   */
  get size() {
    return BitmapConstants.BI_SIZE;
  }

  /**
   * Write the contents of the instance.
   *
   * @return {Buffer} buffer.
   */
  write() {
    const buffer = new Buffer( BitmapConstants.BI_SIZE );
    buffer.writeUInt32LE( BitmapConstants.BI_SIZE );
    buffer.writeInt32LE( this.width );
    buffer.writeInt32LE( this.height );
    buffer.writeUInt16LE( this.planes );
    buffer.writeUInt16LE( this.bitCount );
    buffer.writeUInt32LE( this.compression );
    buffer.writeUInt32LE( this.imageSize );
    buffer.writeInt32LE( this.pixcelsMeterX );
    buffer.writeInt32LE( this.pixcelsMeterY );
    buffer.writeUInt32LE( this.colorUsed );
    buffer.writeUInt32LE( this.colorImportant );

    return buffer;
  }
}
