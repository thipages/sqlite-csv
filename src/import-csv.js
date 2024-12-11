import sqliteCli from "./sqlite-cli.js"
import fieldStats, {getColumnType} from './field-stats.js'
import {STATS_SUFFIX} from './utils.js'
const tempTableName = () => ('temp' + Math.random()).replace('.', '')
const TYPES = ['TEXT', 'REAL', 'INTEGER']
const getFieldNames = (table) => `SELECT name FROM PRAGMA_TABLE_INFO('${table}');`
const defaultOptions = () => ({
    separator :',',
    statsTable : 'main' + STATS_SUFFIX,
    csvTable: 'main',
    primaryKey: 'id'
})
export async function importCsv(dbPath, csvPath, options={}) {
    const { statsTable, separator, csvTable, primaryKey } = Object.assign(
        defaultOptions(),
        options
    )
    const {runCommands} = sqliteCli(dbPath)
    // Import CSV
    await runCommands(
        ['.separator ' + separator,
        `.import ${csvPath} ` + csvTable
        ]        
    )
    // Get fields names
    const fields = (
        await runCommands(
            getFieldNames(csvTable)
        )
    ).map(v => v.name)
    // get Types for each column
    const typesSql = fields
        .map(v => [getColumnType(v, csvTable)])
    const columnTypes = (
        await runCommands(
            ...typesSql
        )
    ).map (
        v => v.map (v => Object.values(v)).flat()
    )
    const fieldsTypes = columnTypes.map (
        (columnType, i) => {
            const type = columnType.length === 1
                ? columnType[0]
                // DEV: string < real < integer
                : Math.min(...columnType)
            const field = fields[i]
            return { field, type }
        }
    )
    // Recreate the table with the right types + set null values
    const tempName = tempTableName()
    const [create, existingPkField] = createTable(tempName, fieldsTypes, primaryKey)
    const _ = existingPkField
        ? ['', '']
        : [primaryKey, 'null'].map(v=>v+',')
    const f = fields.map(v=>'\`'+v+'\`').join(',')
    const setNullSql = fields
        .map (
            field => `UPDATE \`${csvTable}\` SET \`${field}\` = NULL WHERE \`${field}\` = '';`
        )
    await runCommands(
        [
            'BEGIN TRANSACTION;',
            create,
            `INSERT INTO ${tempName} (${_[0]} ${f} ) SELECT ${_[1]} ${f} FROM \`${csvTable}\`;`,
            `DROP TABLE \`${csvTable}\`;`,
            `ALTER TABLE ${tempName} RENAME TO \`${csvTable}\`;`,
            ... setNullSql,
            'COMMIT;'
        ]
    )
    // Compute stats
    const total = (
        await runCommands(
            `SELECT COUNT(*) AS total FROM \`${csvTable}\`;`
        )
    )[0]
    const stats = []
    for (const fieldStat of fieldStats(fieldsTypes, csvTable)) {
        const fStats = Object.assign(
            {},
            ...(await runCommands(...fieldStat)).flat()
        )
        stats.push(
            Object.assign(
                fStats,
                {sType:TYPES[fStats.type].toLowerCase()},
                total
            )
        )
    }
    const statsSql = feedStatsTable(statsTable, stats)
    await runCommands(...statsSql)
    return stats
}


function createTable(name, fieldsTypes, pkFieldName) {
    let existingPkField = false
    const body = fieldsTypes.map(
        ({field, type}) => {
            let def = `\`${field}\` ${TYPES[type]}`
            if (field === pkFieldName) {
                def += ' PRIMARY KEY'
                existingPkField = true
            }
            return def
        }
    )
    if (!existingPkField) body.unshift(`${pkFieldName} INTEGER PRIMARY KEY`)
    return [
        `CREATE TABLE \`${name}\` ( ${body.join(',')} );`,
        existingPkField
    ]
}
function feedStatsTable(table, statsData) {
    const def = Object.keys(statsData[0]).map (
        field => `'${field}' TEXT`
    )
    const values = statsData.map(
        fieldData => {
            const sValues = Object.values(fieldData).map(v=>`'${v}'`).join(',')
            return `INSERT INTO \`${table}\` VALUES (${sValues});`
        }
    )
    return [
        `CREATE TABLE \`${table}\` ( ${def.join(',')} );`,
        ...values
    ]
}