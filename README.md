# npm-icon-gen

[![Build Status](https://travis-ci.org/akabekobeko/npm-icon-gen.svg?branch=master)](https://travis-ci.org/akabekobeko/npm-icon-gen)

Generate an icon files from the **SVG** or **PNG** files.

## Support formats

Supported the output format of the icon are following.

| Platform | Icon |
|:--|:--|
| Windows | app.ico |
| OS X | app.icns |
| Favicon | favicon.ico, favicon-XX.png |

## Installation

```
$ npm install icon-gen
```

## Usage

### SVG

SVG files are rendering to PNG file in [svg2png](https://www.npmjs.com/package/svg2png). Rendering files is output to a temporary directory of the each OS.

Rendering of svg2png is run by [phantomjs](https://www.npmjs.com/package/phantomjs). Please use the PNG directory If the rendering quality there is a problem.

```js
const icongen = require( 'icon-gen' );
const options = {
  report: true
};

icongen( './sample.svg', './dist', { report: true } )
.then( ( results ) => {
  console.log( results );
} )
.catch( ( err ) => {
  console.error( err );
} );
```

### PNG

Generate an icon files from the directory of PNG files.

```js
const icongen = require( 'icon-gen' );

icongen( './images', './dist', { type: 'png', report: true } )
.then( ( results ) => {
  console.log( results );
} )
.catch( ( err ) => {
  console.error( err );
} );
```

Required PNG files is below. Favicon outputs both the ICO and PNG files ( see: [audreyr/favicon-cheat-sheet](https://github.com/audreyr/favicon-cheat-sheet) ).

| Name | Size | ICO | ICNS | Fav ICO | Fav PNG |
|---------:|:----------|:--------:|:--------:|:--------:|:--------:|
|   16.png |     16x16 | &#10004; |          | &#10004; |          |
|   24.png |     24x24 | &#10004; |          | &#10004; |          |
|   32.png |     32x32 | &#10004; | &#10004; | &#10004; | &#10004; |
|   48.png |     48x48 | &#10004; |          | &#10004; |          |
|   57.png |     57x57 |          |          |          | &#10004; |
|   64.png |     64x64 | &#10004; | &#10004; | &#10004; |          |
|   72.png |     72x72 |          |          |          | &#10004; |
|   96.png |     96x96 |          |          |          | &#10004; |
|  120.png |   120x120 |          |          |          | &#10004; |
|  128.png |   128x128 | &#10004; | &#10004; |          | &#10004; |
|  144.png |   144x144 |          |          |          | &#10004; |
|  152.png |   152x152 |          |          |          | &#10004; |
|  195.png |   195x195 |          |          |          | &#10004; |
|  228.png |   228x228 |          |          |          | &#10004; |
|  256.png |   256x256 | &#10004; | &#10004; |          |          |
|  512.png |   512x512 |          | &#10004; |          |          |
| 1024.png | 1024x1024 |          | &#10004; |          |          |


## Node API

### icongen

`icongen` is promisify function.

```js
icongen( src, dest, [options] )
```

| Name | Type | Description |
|:--------|:--|:--|
|     src |   String | Path of the **SVG file** or **PNG files directory** that becomes the source. |
|    dest |   String | Destination directory path. |
| options |   Object | Options. |

Options:

| Name | Type | Description |
|:--------|:--|:--|
| type | String | Type of input file. Allowed value is a `svg` or `png`. 'svg' is SVG file, `png` is PNG files directory. Default is `png`. |
| modes | Array | Mode of output files. Allow value is a `ico`, `icns`, `favicon` and `all`. Default is `all`. |
| report | Boolean | Display the process reports. Default is `false`, disable a report. |

## CLI

```
Usage: icon-gen [OPTIONS]

  Generate an icon from the SVG or PNG file.

  Options:
    -h, --help    Display this text.

    -v, --version Display the version number.

    -i, --input   Path of the SVG file or PNG file directory.

    -o, --output  Path of the output directory.

    -t, --type    Type of the input file.
                  'svg' is the SVG file, 'png' is the PNG files directory.
                  Allowed values: svg, png
                  Default is 'svg'.

    -m, --modes   Mode of the output files.
                  Allowed values: ico, icns, favicon, all
                  Default is 'all'.

    -r, --report  Display the process reports.
                  Default is disable.

  Examples:
    $ icon-gen -i sample.svg -o ./dist -r
    $ icon-gen -i ./images -o ./dist -t png -r
    $ icon-gen -i sample.svg -o ./dist -m ico,favicon -r

  See also:
    https://github.com/akabekobeko/npm-icon-gen
```

# ChangeLog

* [CHANGELOG](CHANGELOG.md)

# License

* [MIT](LICENSE.txt)
