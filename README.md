# npm-icon-gen

[![Support Node of LTS](https://img.shields.io/badge/node-LTS-brightgreen.svg)](https://nodejs.org/)
[![npm version](https://badge.fury.io/js/icon-gen.svg)](https://badge.fury.io/js/icon-gen)
![test](https://github.com/akabekobeko/npm-icon-gen/workflows/test/badge.svg)

Generate an icon files from the **SVG** or **PNG** files.

## Support formats

Supported the output format of the icon are following.

| Platform | Icon                                |
| -------: | ----------------------------------- |
|  Windows | `app.ico` or specified name.        |
|    macOS | `app.icns` or specified name.       |
|  Favicon | `favicon.ico` and `favicon-XX.png`. |

## Installation

```
$ npm install icon-gen
```

## Usage

SVG and PNG are automatically selected from the `input` path. If the path indicates a file **SVG**, if it is a directory it will be a **PNG** folder.

### SVG

SVG files are rendering to PNG file in [sharp](https://www.npmjs.com/package/sharp). Rendering files is output to a temporary directory of the each OS.

```js
const icongen = require('icon-gen')

icongen('./sample.svg', './icons', { report: true })
  .then((results) => {
    console.log(results)
  })
  .catch((err) => {
    console.error(err)
  })
```

Stopped using [svg2png](https://www.npmjs.com/package/svg2png) because of its dependency on [phantomjs](https://www.npmjs.com/package/phantomjs), which is deprecated.

The quality of PNG generated from SVG will change, so if you need the previous results, use icon-gen v2.1.0.

```
$ npm install icon-gen@2.1.0
```

In the future, I may add SVG to PNG conversion by Chromium via [puppeteer-core](https://www.npmjs.com/package/puppeteer-core) in addition to [sharp](https://www.npmjs.com/package/sharp).

### PNG

Generate an icon files from the directory of PNG files.

```js
const icongen = require('icon-gen')

icongen('./images', './icons', { report: true })
  .then((results) => {
    console.log(results)
  })
  .catch((err) => {
    console.error(err)
  })
```

Required PNG files is below. Favicon outputs both the ICO and PNG files (see: [audreyr/favicon-cheat-sheet](https://github.com/audreyr/favicon-cheat-sheet)).

|     Name |      Size |   ICO    |   ICNS   | Fav ICO  | Fav PNG  |
| -------: | --------: | :------: | :------: | :------: | :------: |
|   16.png |     16x16 | &#10004; | &#10004; | &#10004; |          |
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

To make it a special size configuration, please specify with `ico`,`icns` and `favicon` options.

## Node API

### icongen

**icongen** is promisify function.

`icongen(src, dest[, options])`

| Name    | Type     | Description                                                                  |
| ------- | -------- | ---------------------------------------------------------------------------- |
| src     | `String` | Path of the **SVG file** or **PNG files directory** that becomes the source. |
| dest    | `String` | Destination directory path.                                                  |
| options | `Object` | see: _Options_.                                                              |

_Options:_

```js
const options = {
  report: true,
  ico: {
    name: 'app',
    sizes: [16, 24, 32, 48, 64, 128, 256]
  },
  icns: {
    name: 'app',
    sizes: [16, 32, 64, 128, 256, 512, 1024]
  },
  favicon: {
    name: 'favicon-',
    pngSizes: [32, 57, 72, 96, 120, 128, 144, 152, 195, 228],
    icoSizes: [16, 24, 32, 48, 64]
  }
}
```

If all image options (`ico`,`icns`, `favicon`) are omitted, all images are output with their default settings.

```js
// Output an all images with default settings
const options = {
  report: true
}
```

If individual image option is omitted, default setting is used. If there is a format that you do not want to output, specify others and omit that image.

```js
// Without ICNS
const options = {
  report: true,
  ico: {}
  favicon: {}
}
```

| Name    | Type      | Description                                                        |
| ------- | --------- | ------------------------------------------------------------------ |
| report  | `Boolean` | Display the process reports. Default is `false`, disable a report. |
| ico     | `Object`  | Output setting of ICO file.                                        |
| icns    | `Object`  | Output setting of ICNS file.                                       |
| favicon | `Object`  | Output setting of Favicon file (PNG and ICO).                      |

_`ico`, `icns`_

| Name  | Type       | Default         | Description                  |
| ----- | ---------- | --------------- | ---------------------------- |
| name  | `String`   | `app`           | Name of an output file.      |
| sizes | `Number[]` | `[Defaults...]` | Structure of an image sizes. |

_`favicon`_

| Name     | Type       | Default         | Description                                                                                                                                            |
| -------- | ---------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| name     | `String`   | `favicon-`      | Prefix of an output PNG files. Start with the alphabet, can use `-` and `_`. This option is for PNG. The name of the ICO file is always `favicon.ico`. |
| pngSizes | `Number[]` | `[Defaults...]` | Size structure of PNG files to output.                                                                                                                 |
| icoSizes | `Number[]` | `[Defaults...]` | Structure of an image sizes for ICO.                                                                                                                   |

## CLI

```
Usage:  icon-gen [options]

Generate an icon from the SVG or PNG file.
If "--ico", "--icns", "--favicon" is not specified, everything is output in the standard setting.

Options:
  -i, --input <Path>           Path of the SVG file or PNG file directory.
  -o, --output <Path>          Path of the output directory.
  -r, --report                 Display the process reports, default is disable.
  --ico                        Output ICO file with default settings, option is "--ico-*".
  --ico-name <Name>            ICO file name to output.
  --ico-sizes [Sizes]          PNG size list to structure ICO file
  --icns                       Output ICNS file with default settings, option is "--icns-*".
  --icns-name <Name>           ICO file name to output.
  --icns-sizes [Sizes]         PNG size list to structure ICNS file
  --favicon                    Output Favicon files with default settings, option is "--favicon-*".
  --favicon-name <Name>        prefix of the PNG file. Start with the alphabet, can use "-" and "_"
  --favicon-png-sizes [Sizes]  Sizes of the Favicon PNG files
  --favicon-ico-sizes [Sizes]  PNG size list to structure Favicon ICO file
  -v, --version                output the version number
  -h, --help                   output usage information

Examples:
  $ icon-gen -i sample.svg -o ./dist -r
  $ icon-gen -i ./images -o ./dist -r
  $ icon-gen -i sample.svg -o ./dist --ico --icns
  $ icon-gen -i sample.svg -o ./dist --ico --ico-name sample --ico-sizes 16,32
  $ icon-gen -i sample.svg -o ./dist --icns --icns-name sample --icns-sizes 16,32
  $ icon-gen -i sample.svg -o ./dist --favicon --favicon-name=favicon-  --favicon-png-sizes 16,32,128 --favicon-ico-sizes 16,32

See also:
  https://github.com/akabekobeko/npm-icon-gen
```

# ChangeLog

- [CHANGELOG](CHANGELOG.md)

# License

- [MIT](LICENSE.txt)
