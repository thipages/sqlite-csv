import fieldStats from './sql/fields-stats.js'
import {TYPES} from './utils.js'
export function getStats(csvTable, fieldsTypes, runCommands) {
    return getSqlStatsFromCsvTable(csvTable, fieldsTypes, runCommands)
}
export async function createStatsTable(csvTable, statsTable, fieldsTypes, runCommands) {
    const stats = await getStats(csvTable, fieldsTypes, runCommands)
    const createAndFeedSql = getSqlForCreatingAndFeedingStatsTable(statsTable, stats)
    console.log(createAndFeedSql)
    await runCommands(...createAndFeedSql)
    return stats
}
async function getSqlStatsFromCsvTable(csvTable, fieldsTypes, runCommands) {
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
    return stats
}
function getSqlForCreatingAndFeedingStatsTable(table, statsData) {
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