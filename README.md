# npm-icon-gen

[![Support Node of LTS](https://img.shields.io/badge/node-LTS-brightgreen.svg)](https://nodejs.org/)
[![npm version](https://badge.fury.io/js/icon-gen.svg)](https://badge.fury.io/js/icon-gen)
[![Build Status](https://travis-ci.org/akabekobeko/npm-icon-gen.svg?branch=master)](https://travis-ci.org/akabekobeko/npm-icon-gen)
[![Document](https://img.shields.io/badge/document-ESDoc-brightgreen.svg)](https://akabekobeko.github.io/npm-icon-gen/)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)

Generate an icon files from the **SVG** or **PNG** files.

## Node.js requirements

This module depends on [svg2png](https://github.com/domenic/svg2png). Therefore we need **Node v6 or later**. The following is a quotation from `README` of **svg2png**.

> svg2png uses the latest in ES2015 features, and as such requires a recent version of Node.js. Only the 6.x series onward is supported.

## Support formats

Supported the output format of the icon are following.

|Platform|Icon|
|--:|---|
|Windows|`app.ico` or specified name.|
|macOS|`app.icns` or specified name.|
|Favicon|`favicon.ico` and `favicon-XX.png`.|

## Installation

```
$ npm install icon-gen
```

## Usage

SVG and PNG are automatically selected from the `input` path. If the path indicates a file **SVG**, if it is a directory it will be a **PNG** folder.

### SVG

SVG files are rendering to PNG file in **svg2png**. Rendering files is output to a temporary directory of the each OS.

Rendering of svg2png is run by [phantomjs](https://www.npmjs.com/package/phantomjs). Please use the PNG directory If the rendering quality there is a problem.

```js
const icongen = require('icon-gen');

icongen('./sample.svg', './icons', { report: true })
.then((results) => {
  console.log(results)
})
.catch((err) => {
  console.error(err)
});
```

### PNG

Generate an icon files from the directory of PNG files.

```js
const icongen = require('icon-gen');

icongen('./images', './icons', , { report: true })
.then((results) => {
  console.log(results);
} )
.catch((err) => {
  console.error(err);
});
```

Required PNG files is below. Favicon outputs both the ICO and PNG files (see: [audreyr/favicon-cheat-sheet](https://github.com/audreyr/favicon-cheat-sheet)).

|Name    |Size     |ICO     |ICNS    |Fav ICO |Fav PNG |
|-------:|--------:|:------:|:------:|:------:|:------:|
|  16.png|    16x16|&#10004;|&#10004;|&#10004;|        |
|  24.png|    24x24|&#10004;|        |&#10004;|        |
|  32.png|    32x32|&#10004;|&#10004;|&#10004;|&#10004;|
|  48.png|    48x48|&#10004;|        |&#10004;|        |
|  57.png|    57x57|        |        |        |&#10004;|
|  64.png|    64x64|&#10004;|&#10004;|&#10004;|        |
|  72.png|    72x72|        |        |        |&#10004;|
|  96.png|    96x96|        |        |        |&#10004;|
| 120.png|  120x120|        |        |        |&#10004;|
| 128.png|  128x128|&#10004;|&#10004;|        |&#10004;|
| 144.png|  144x144|        |        |        |&#10004;|
| 152.png|  152x152|        |        |        |&#10004;|
| 195.png|  195x195|        |        |        |&#10004;|
| 228.png|  228x228|        |        |        |&#10004;|
| 256.png|  256x256|&#10004;|&#10004;|        |        |
| 512.png|  512x512|        |&#10004;|        |        |
|1024.png|1024x1024|        |&#10004;|        |        |

To make it a special size configuration, please specify with `ico`,` icns` and `favicon` options.

## Node API

### icongen

**icongen** is promisify function.

`icongen(src, dest[, options])`

|Name|Type|Description|
|---|---|---|
|src |`String`|Path of the **SVG file** or **PNG files directory** that becomes the source.|
|dest |`String`|Destination directory path.|
|options|`Object`|see: _Options_.|

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
    sizes:  [16, 32, 64, 128, 256, 512, 1024]
  },
  favicon: {
    name: 'favicon-',
    sizes:  [32, 57, 72, 96, 120, 128, 144, 152, 195, 228],
    ico: [16, 24, 32, 48, 64]
  }
};
```

If all image options (`ico`,` icns`, `favicon`) are omitted, all images are output with their default settings.

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

|Name|Type|Description|
|---|---|---|
|report|`Boolean` |Display the process reports. Default is `false`, disable a report.|
|ico|`Object`|Output setting of ICO file.|
|icns|`Object`|Output setting of ICNS file.|
|favicon|`Object`|Output setting of Favicon file (PNG and ICO).|

_`ico`, `icns`_

|Name|Type|Default|Description|
|---|---|---|---|
|name|`String`|`app`|Name of an output file.|
|sizes|`Number[]`|`[Defaults...]`|Structure of an image sizes.|

_`favicon`_

|Name|Type|Default|Description|
|---|---|---|---|
|name|`String`|`favicon-`|Prefix of an output PNG files. Start with the alphabet, can use `-` and `_`. This option is for PNG. The name of the ICO file is always `favicon.ico`.|
|sizes|`Number[]`|`[Defaults...]`|Size structure of PNG files to output.|
|ico|`Number[]`|`[Defaults...]`|Structure of an image sizes for ICO.|



## CLI

```
Usage: icon-gen [OPTIONS]

Generate an icon from the SVG or PNG file.
If '--ico', '--icns', '--favicon' is not specified, everything is output in the standard setting.

Options:
-h, --help    Display this text.
-v, --version Display the version number.
-i, --input   Path of the SVG file or PNG file directory.
-o, --output  Path of the output directory.
-r, --report  Display the process reports.
              Default is disable.
--ico         Output ICO file with the specified 'name' and 'sizes'.
              ex. --ico name=foo sizes=16,32,128
--icns        Output ICO file with the specified 'name' and 'sizes'.
              ex. --icns name=bar sizes=32,1024
--favicon     Output Favicon files with the specified 'ico', 'name' and 'sizes'.
              'ico' is the size of the ICO file.
              'name' is the prefix of the PNG file. Start with the alphabet, can use '-' and '_'.
              'sizes' is the size of the PNG file.
              ex. '--favicon ico=16,32 name=favicon- sizes=16,32,128'

Examples:
$ icon-gen -i sample.svg -o ./dist -r
$ icon-gen -i ./images -o ./dist -r
$ icon-gen -i sample.svg -o ./dist --ico --icns
$ icon-gen -i sample.svg -o ./dist --ico --favicon ico=16,32 name=favicon- sizes=16,32,128

See also:
https://github.com/akabekobeko/npm-icon-gen
```

# ChangeLog

* [CHANGELOG](CHANGELOG.md)

# License

* [MIT](LICENSE.txt)
