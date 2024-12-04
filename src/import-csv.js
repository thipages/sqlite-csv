import sqliteCli from "./sqlite-cli.js"
import fieldStats, {getColumnType} from "./field-stats.js"
const tempTableName = () => ('temp' + Math.random()).replace('.', '')
const TYPES = ['TEXT', 'REAL', 'INTEGER']
const getFieldNames = (table) => `SELECT name FROM PRAGMA_TABLE_INFO('${table}');`
const fallbackPrimaryKey = 'csv_id'
const defaultOptions = {
    separator :',',
    statsTable : 'main_stats',
    csvTable: 'main',
    primaryKey: 'id'
}
export {sqliteCli}
export async function importCsv(dbPath, csvPath, options={}) {
    const { statsTable, separator, csvTable, primaryKey } = Object.assign(
        defaultOptions,
        options
    )
    const {oneCall, concurentCalls, sequentialCalls} = sqliteCli(dbPath)
    // Import CSV
    await oneCall(
        [
            '.separator ' + separator,
            `.import ${csvPath} ` + csvTable           
        ]
    )
    // Get fields names
    const fields = (
        await oneCall(
            getFieldNames(csvTable)
        )
    ).map(v => v.name)
    // get Types for each column
    const typesSql = fields
        .map(v => getColumnType(v, csvTable))
    const ct = (await Promise.all(
        typesSql.map(oneCall)
    ))
    const columnTypes = ct.map (
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
    const [create, finalPkFieldName] = createTable(tempName, fieldsTypes, primaryKey, fallbackPrimaryKey)
    const _ = [finalPkFieldName, 'null'].map(v=>v+',')
    const f = fields.map(v=>'\`'+v+'\`').join(',')
    const setNullSql = fields
        .map (
            field => `UPDATE \`${csvTable}\` SET \`${field}\` = NULL WHERE \`${field}\` = '';`
        )
    await oneCall(
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
        await oneCall(
            `SELECT COUNT(*) AS total FROM \`${csvTable}\`;`
        )
    )[0]
    const stats = []
    for (const fieldStat of fieldStats(fieldsTypes, csvTable)) {
        const fStats = Object.assign({}, ...(await concurentCalls(fieldStat)).flat())
        stats.push(
            Object.assign(
                fStats,
                {sType:TYPES[fStats.type].toLowerCase()},
                total
            )
        )
    }
    const statsSql = feedStatsTable(statsTable, stats)
    await sequentialCalls(statsSql)
    return stats
}


function createTable(name, fieldsTypes, pkFieldName, fallbackPkFieldName) {
    let finalPkFieldName = pkFieldName
    const body = fieldsTypes.map(
        ({field, type}) => {
            let def = `\`${field}\` ${TYPES[type]}`
            if (field === pkFieldName) {
                def += ' PRIMARY KEY'
                finalPkFieldName = field
            }
            return def
        }
    )
    body.unshift(`${finalPkFieldName} INTEGER PRIMARY KEY`)
    return [
        `CREATE TABLE \`${name}\` ( ${body.join(',')} );`,
        finalPkFieldName
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