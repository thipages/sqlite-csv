#!/usr/bin/env node
import run from './../src/bin.js'
const args = process.argv.slice(2, process.argv.length)
const dbName = args[0]
const currentDir = process.cwd()
await run(currentDir, dbName)
process.exit(0)