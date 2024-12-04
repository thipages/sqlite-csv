#!/usr/bin/env node
import {importCsv} from './../src/index.js'
import fs from 'node:fs'

const args = process.argv.slice(2, process.argv.length)
/*
import path from 'node:path'
const currentDir = process.cwd()
const {root, dir, base, ext, name} = path.parse(args[0])
const folderPath = path.join(root, dir)

const files = fs.readdirSync(folderPath)
const csvFiles = files.filter((file) => {
    const filePath = path.join(folderPath, file)
    const ext = path.extname(filePath)
    return (ext === '.csv')
})*/

const [ext, ...pathAndName] = args[0].split('.').reverse()
const dbPath = pathAndName.reverse() + '.db'
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