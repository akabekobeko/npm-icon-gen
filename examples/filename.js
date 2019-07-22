const icongen = require('icon-gen')

const options = {
  ico: {
    name: 'foo'
  },
  icns: {
    name: 'bar'
  },
  favicon: {
    name: 'icon-'
  },
  report: true
}

icongen('./data/sample.svg', './icons', options)
  .then((results) => {
    console.log('Completed!!')
  })
  .catch((err) => {
    console.error(err)
  })
