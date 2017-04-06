const icongen = require('icon-gen')

const options = {
  report: true
}

icongen('../test/data/sample.svg', './icons', options)
.then((results) => {
  console.log(results)
})
.catch((err) => {
  console.error(err)
})
