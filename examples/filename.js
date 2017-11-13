const icongen = require('icon-gen')

const options = {
  names: {
    ico: 'foo',
    icns: 'bar'
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
