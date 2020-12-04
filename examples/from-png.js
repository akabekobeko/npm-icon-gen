const icongen = require('icon-gen')
require('./clean')('./icons')

const options = {
  report: true
}

icongen('./data', './icons', options)
  .then((results) => {
    console.log(results)
    console.log('Completed!!')
  })
  .catch((err) => {
    console.error(err)
  })
