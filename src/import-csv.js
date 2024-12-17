import sqliteCli from "./sqlite-cli.js"
import columnType from "./sql/column-type.js"
import { recreateTable } from "./sql/create-table.js"
import { wrapTransaction, getFieldNames } from "./sql/pragma.js"
import { STATS_SUFFIX } from './utils.js'
import { createStatsTable } from "./stats.js"
const defaultOptions = () => ({
    separator :',',
    statsTable : 'main' + STATS_SUFFIX,
    csvTable: 'main',
    primaryKey: 'id',
    fkRelations: []
})
export async function importCsv(dbPath, csvPath, options={}) {
    const { statsTable, separator, csvTable, primaryKey, fkRelations } = Object.assign(
        defaultOptions(),
        options
    )
    const {runCommands} = sqliteCli(dbPath)
    // Import CSV
    await runCommands(
        '.separator ' + separator,
        `.import ${csvPath} ` + csvTable      
    )
    // Get fields types
    const fieldsTypes = await getFieldsTypesFromCsvTable(csvTable, runCommands)
    // Recreate csvTable with the right types
    await runCommands(
        ...wrapTransaction(
            recreateTable(csvTable, fieldsTypes, primaryKey, fkRelations)
        )
    )
    // Stats table creation
    return createStatsTable(csvTable, statsTable, fieldsTypes, runCommands)
}
async function getFieldsTypesFromCsvTable(csvTable, runCommands) {
    // Get fields names
    const fields = (
        await runCommands(
            getFieldNames(csvTable)
        )
    ).map(v => v.name)
    // get Types for each column
    const typesSql = fields
        .map(v => [columnType(v, csvTable)])
    const ct = (
        await runCommands(
            ...typesSql
        )
    )
    // DEV: Need to "re-array" in case of one query
    const _ct =  ct.length === 1 ? [ct] : ct
    const columnTypes = _ct.map (
        v => v.map (v => Object.values(v)).flat()
    )
    return columnTypes.map (
        (columnType, i) => {
            const type = columnType.length === 1
                ? columnType[0]
                // DEV: string < real < integer
                : Math.min(...columnType)
            const field = fields[i]
            return { field, type }
        }
    )
}