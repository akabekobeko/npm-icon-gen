const fs = require('fs')
const path = require('path')

const clean = (dir) => {
  const items = fs.readdirSync(dir)
  for (const item of items) {
    switch (path.extname(item)) {
      case '.ico':
      case '.icns':
      case '.png':
        fs.unlinkSync(path.join(dir, item))
        break

      default:
        break
    }
  }
}

module.exports = clean
