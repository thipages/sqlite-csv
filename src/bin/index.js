import fs, { unlinkSync } from 'node:fs'
import path from 'node:path'
import {importCsv, sqliteCli} from '../index.js'
import {autodetectSeparator, firstLine, normalizePath} from '../utils.js'
import {STATS_SUFFIX} from '../utils.js'
import { parseFks } from './utils.js'
import { recreateTable } from '../sql/create-table.js'
import { wrapTransaction } from '../sql/pragma.js'
//
const EXT = ".csv"
export default async function(currentDir, dbName, options) {
    const fks = options?.fk ? parseFks(options.fk) : []
    const  osql = options?.sql
    const sqlLoaderPath = osql ? options.sql[0] : null
    //
    const files = fs.readdirSync(currentDir)
    const csvFiles = files.filter((filename) => {
        return path.extname(filename) === '.csv'
    }).map(
        filename => {
            const ext = path.extname(filename)
            return path.basename(filename, ext)
        }
    )
    const tableStats = {}
    const dbPath = normalizePath(path.join(currentDir, dbName))
    // remove database if exists
    try {unlinkSync(dbPath)} catch(e) {}
    const { runCommands } = sqliteCli(dbPath)
    for (const base of csvFiles) { 
        const csvPath =  normalizePath(path.join(currentDir, base + EXT))
        const _ = await firstLine(csvPath)
        const separator = autodetectSeparator(_)
        const _fkRelations = fks
            .filter (v => v.name === base) [0]
            ?.foreignKeys
            ?.map(v => v.sql) || []
        const stats = await importCsv(
            dbPath,
            csvPath, {
                separator,
                csvTable: base,
                statsTable: base + STATS_SUFFIX,
                fkRelations: _fkRelations
            }
        )
        tableStats[base] = stats.map(v=>({field: v.field, type: v.type}))
        tableStats[base].fk = _fkRelations
    }
    const orders = csvFiles.map(
        table => {
            const fieldsTypes = tableStats[table]
            const fk = fieldsTypes.fk
            return recreateTable(table, fieldsTypes, 'id', fk)
        }
    ).flat()
    await runCommands(
        ... wrapTransaction(orders)
    )
    if (sqlLoaderPath) {
        try {
            const sql = ''+fs.readFileSync(sqlLoaderPath)
            if (sql) await runCommands(sql)
        } catch (e) {}
    }
}