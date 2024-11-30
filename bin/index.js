import {importCsv} from './../src/index.js'
import fs from 'node:fs'
const args = process.argv.slice(2, process.argv.length)
const [ext, ...path] = args[0].split('.').reverse()
const dbPath = path.reverse() + '.sqlite'
try {
    isValid(args[0], dbPath)
    await importCsv(
        dbPath,
        args[0]
    )
} catch (e) {
    console.error(e.message)
}
process.exit(0)

function isValid(csvPath, dbPath) {
    if (!fs.existsSync(csvPath)) {
        throw new Error(`CSV path is incorrect (${csvPath})`)
    }
    if (fs.existsSync(dbPath)) {
        throw new Error(`Cannot import csv file : DB path already exists (${dbPath})`)
    }
}