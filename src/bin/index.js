#!/usr/bin/env node

import CLI from './cli.js'

CLI(process.argv.slice(2), process.stdout).catch((err) => {
  console.error(err)
})
