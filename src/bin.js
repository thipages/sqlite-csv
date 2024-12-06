import {importCsv} from './index.js'
import {autodetectSeparator, firstLine, normalizePath} from './utils.js'
import {STATS_SUFFIX} from './utils.js'
import fs from 'node:fs'
import path from 'node:path'
//
export default async function(currentDir, dbName) {
    const files = fs.readdirSync(currentDir)
    const csvFiles = files.filter((filename) => {
        return path.extname(filename) === '.csv'
    }).map(
        filename => {
            const ext = path.extname(filename)
            return [
                path.basename(filename, ext),
                ext
            ]
        }
    )
    for (const [base, ext] of csvFiles) {        
        const csvPath =  normalizePath(path.join(currentDir, base + ext))
        const dbPath = normalizePath(path.join(currentDir, dbName))
        const _ = await firstLine(csvPath)
        const separator = autodetectSeparator(_)
        await importCsv(
            dbPath, csvPath, {
                separator,
                csvTable: base,
                statsTable: base + STATS_SUFFIX
            }
        )
    }
}

