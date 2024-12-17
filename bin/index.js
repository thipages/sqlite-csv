#!/usr/bin/env node
import run from './../src/bin/index.js'
const args = process.argv.slice(2, process.argv.length)
const dbName = args.shift()
const currentDir = process.cwd()
await run(currentDir, dbName, getOptions(args))
process.exit(0)

function getOptions(args) {
    const obj = {}
    let currentOption = null
    for (const arg of args) {
        if (arg.startsWith('-')) {
            currentOption = arg.substring(1)
            obj[currentOption] = []
        } else {
            if (currentOption === null) {
                throw new Error('malformed cli option')
            } else {
                obj[currentOption].push(arg)
            }
        }
    }
    return obj
}