import sqliteCli from "./sqlite-cli.js"
import columnType from "./sql/column-type.js"
import { recreateTable } from "./sql/create-table.js"
import { wrapTransaction, getFieldNames } from "./sql/pragma.js"
import { getFkSqlFromDefinition, STATS_SUFFIX } from './utils.js'
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
    console.log('Import started at ' + new Date)
    await runCommands(
        `.separator  "${separator}"`,
        `.import ${csvPath} ` + csvTable      
    )
    console.log('Import finished at ' + new Date)
    // Count records
    const {total} = (
        await runCommands(
            `SELECT COUNT(*) AS total FROM \`${csvTable}\`;`
        )
    )[0]
    console.log(`Total records : ${ total} `)
    // Get fields types
    const fieldsTypes = await getFieldsTypesFromCsvTable(csvTable, total, runCommands, fkRelations, primaryKey)
    console.log(`All fields types computed at `+ new Date)
    // Recreate csvTable with the right types
    await runCommands(
        ...wrapTransaction(
            recreateTable(
                csvTable,
                fieldsTypes,
                primaryKey,
                fkRelations.map(getFkSqlFromDefinition)
            )
        )
    )   
    // Stats table creation
    return createStatsTable(csvTable, statsTable, fieldsTypes, runCommands)
}
async function getFieldsTypesFromCsvTable(csvTable, total, runCommands, fkRelations, primaryKey) {
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
    // Check for missing columns (all empty columns)
    if (_ct.length !== fields.length) {
        const ctFields = _ct.map (
            v => Object.keys(v[0])
        ).flat()
        // identify and add missing columns
        const fkColumns = fkRelations.map(v => v.column)
        for (const [index, field] of fields.entries()) {
            if (!ctFields.includes(field)) {
                // Insert the missing column at the right place
                // if the column is a foreign key, type is integer else text
                const type = fkColumns.includes(field) ? 2 : 0
                _ct.splice(index, 0, [{[field]: type}])
            }
        }
    }
    const columnTypes = _ct.map (
        v => v.map (v => Object.values(v)).flat()
    )
    const finalColumnTypes = columnTypes.map (
        (columnType, i) => {
            const type = columnType.length === 1
                ? columnType[0]
                // DEV: string < real < integer
                : Math.min(...columnType)
            const field = fields[i]
            return { field, type }
        }
    )
    // DEV: Case of no data and id column
    // id field is set to integer
    if (total === 0) {
        const index = finalColumnTypes.findIndex( v => v.field === primaryKey)
        if (index!== -1) finalColumnTypes[index].type = 2
    }
    return finalColumnTypes
}