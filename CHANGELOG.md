# ChangeLog

## 4.0.0

### Breaking Changes

- feat: [Breaking Cgange] support Node.js v18 [#149](https://github.com/akabekobeko/npm-icon-gen/pull/149)

### Chore

- Removed unnecessary uuid lib [#158](https://github.com/akabekobeko/npm-icon-gen/pull/158) by [panther7](https://github.com/panther7)

## 3.0.1

### Features

- update sharp [#144](https://github.com/akabekobeko/npm-icon-gen/pull/144) by [jhicken](https://github.com/jhicken)

## 3.0.0

### Breaking Changes

- Support Node.js v12 or later [#122](https://github.com/akabekobeko/npm-icon-gen/issues/122)
- change to sharp [#136](https://github.com/akabekobeko/npm-icon-gen/pull/136) by [mifi (Mikael Finstad)](https://github.com/mifi)

SVG files are rendering to PNG file in [sharp](https://www.npmjs.com/package/sharp). Rendering files is output to a temporary directory of the each OS.

Stopped using [svg2png](https://www.npmjs.com/package/svg2png) because of its dependency on [phantomjs](https://www.npmjs.com/package/phantomjs), which is deprecated.

The quality of PNG generated from SVG will change, so if you need the previous results, use icon-gen v2.1.0.

```
$ npm install icon-gen@2.1.0
```

In the future, I may add SVG to PNG conversion by Chromium via [puppeteer-core](https://www.npmjs.com/package/puppeteer-core) in addition to [sharp](https://www.npmjs.com/package/sharp).

## 2.1.0

### Breaking Changes

Please be sure to read the `README` because there are many changes.

- Drop Node 8
- Change CLI/Node options

### Features

- To TypeScript and bundle `d.ts` file [#108](https://github.com/akabekobeko/npm-icon-gen/issues/108)

### Bug Fixes

- Strict stream finish for ICNS/ICO generation [#126](https://github.com/akabekobeko/npm-icon-gen/issues/126) by [quanglam2807 (Quang Lam)](https://github.com/quanglam2807)
- Delete file execution attribute [#113](https://github.com/akabekobeko/npm-icon-gen/issues/113)

### Documentation

- Update README.md [#119](https://github.com/akabekobeko/npm-icon-gen/pull/119/files) by [rickysullivan (Ricky Sullivan Himself)](https://github.com/rickysullivan)
- Remove "Node.js requirements" section from README.md [#114](https://github.com/akabekobeko/npm-icon-gen/pull/114) by [MakeNowJust (TSUYUSATO Kitsune)](https://github.com/MakeNowJust)

## v2.0.0

### Breaking Changes

Please be sure to read the `README` because there are many changes.

- Drop Node 6 [#101](https://github.com/akabekobeko/npm-icon-gen/issues/101)
- Change CLI/Node options [#98](https://github.com/akabekobeko/npm-icon-gen/issues/98)

## Features

- Support size specification of PNG (in Favicon) [#97](https://github.com/akabekobeko/npm-icon-gen/issues/97)

## v1.2.3

### Bug Fixes

- Fix generating icons without specifying sizes [#94](https://github.com/akabekobeko/npm-icon-gen/pull/94) by [doug-a-brunner (Doug Brunner)](https://github.com/doug-a-brunner)

## v1.2.2

### Features

- Support Node v10.x [#90](https://github.com/akabekobeko/npm-icon-gen/issues/90)

### Bug Fixes

- CLI size specification is not working [#89](https://github.com/akabekobeko/npm-icon-gen/issues/89)

## v1.2.1

### Features

- Support Node 9 [#87](https://github.com/akabekobeko/npm-icon-gen/issues/87)

## v1.2.0

### Features

- Supports `is32` and `il32` [#71](https://github.com/akabekobeko/npm-icon-gen/issues/71)

## v1.1.5

### Bug Fixes

- Fail if the `sizes` option is not specified [#66](https://github.com/akabekobeko/npm-icon-gen/issues/66)

## v1.1.4

### Features

- add sizes option to define witch size of png to include [#62](https://github.com/akabekobeko/npm-icon-gen/pull/62) by [beijaflor (sho otani)](https://github.com/beijaflor)

## v1.1.3

### Bug Fixes

- Close a write stream [#57](https://github.com/akabekobeko/npm-icon-gen/pull/57) by [satorf](https://github.com/satorf)
- Close stream explicitly [#58](https://github.com/akabekobeko/npm-icon-gen/issues/58)

## v1.1.2

### Bug Fixes

- npm install fails [#56](https://github.com/akabekobeko/npm-icon-gen/issues/56)

## v1.1.0

### Features

- Using the Babel and change structure of project [#55](https://github.com/akabekobeko/npm-icon-gen/issues/55)
- Add ICNS Retina support [#52](https://github.com/akabekobeko/npm-icon-gen/pull/52) by [quanglam2807 (Quang Lam)](https://github.com/quanglam2807)
- **Drop the Node v4 (Breaking change)** [#51](https://github.com/akabekobeko/npm-icon-gen/issues/51)

### Bug Fixes

- Icon can not be set as Finder's Folder [#54](https://github.com/akabekobeko/npm-icon-gen/issues/54)
- ICNS displays incorrectly in Launchpad folder [#53](https://github.com/akabekobeko/npm-icon-gen/issues/53)

## 1.0.8

### Features

- Drop transpile by Babel [#48](https://github.com/akabekobeko/npm-icon-gen/issues/48)

## v1.0.7

### Features

- Update uuid to version 3.0.0 [#45](https://github.com/akabekobeko/npm-icon-gen/pull/45) by [marcbachmann (Marc Bachmann)](https://github.com/marcbachmann)

## 1.0.6

### Features

- Node v7 support [#41](https://github.com/akabekobeko/npm-icon-gen/issues/41)

### Bug Fixes

- Icns not working [#42](https://github.com/akabekobeko/npm-icon-gen/issues/42)
- Fix icns generation [#43](https://github.com/akabekobeko/npm-icon-gen/pull/43) by [mifi (Mikael Finstad)](https://github.com/mifi)

## 1.0.5

### Features

- Correct default for `options.type` [#39](https://github.com/akabekobeko/npm-icon-gen/pull/39) by [atdrago (Adam Drago)](https://github.com/atdrago)

## 1.0.4

### Features

- Allow specifying icon file name [#38](https://github.com/akabekobeko/npm-icon-gen/issues/38)

## v1.0.3

### Features

- ICNS size adjustments [#32](https://github.com/akabekobeko/npm-icon-gen/issues/32)

### Bug Fixes

- It is an error to omit the modes in options [#33](https://github.com/akabekobeko/npm-icon-gen/issues/33)

## v1.0.2

### Features

- Update a node modules
- Node v6 support

## v1.0.1

### Features

- Update a node modules
- All of the file is output in a mode other than all [#25](https://github.com/akabekobeko/npm-icon-gen/issues/25)
- Wrong PNG mode of message [#24](https://github.com/akabekobeko/npm-icon-gen/issues/24)
- Implement an output mode [#22](https://github.com/akabekobeko/npm-icon-gen/issues/22)

## v1.0.0

- First release
