#!/usr/bin/env node

import cli from './cli.js'

cli(process.argv).catch((err) => {
  console.error(err)
})
