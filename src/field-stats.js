const quote = s => "`"+s+"`"
export const getColumnType = (field, table) => {
    const f = quote(field)
    return `
        SELECT
            DISTINCT case
                WHEN ${f} regexp '^-?\\d+\\.\\d+$' THEN 1
                WHEN ${f} regexp '^-?[1-9]\\d*$' THEN 2
                ELSE 0
            END as ${f}
        FROM ${table} WHERE ${f} <>'';
    `
}
export default function(fieldsTypes, csvTable) {
    return fieldsTypes
    .map (
        ({field, type}) => {
            const f = quote(field)
            return [
                type === 0
                    ? stringStats(csvTable, field, type)
                    : numberStats(csvTable, field, type),
                    `SELECT COUNT(DISTINCT ${f}) 'distinct' from ${csvTable} ;`,
                    `SELECT COUNT(*) 'null' from ${csvTable} WHERE ${f} IS NULL;`,
            ]
        }
    )
}
function numberStats(table, field, type) {
    const f = quote(field)
    return `
        SELECT '${field}' AS field, ${type} type,
            MIN(${f}) AS min,
            MAX(${f}) AS max,
            AVG(${f}) AS avg
        FROM ${table} WHERE ${f} IS NOT NULL;`
}
function stringStats(table, field, type) {
    const f = quote(field)
    return `SELECT '${field}' AS field, ${type} type,
                MIN(LENGTH(${f})) AS min,
                MAX(LENGTH(${f})) AS max,
                AVG(LENGTH(${f})) AS avg
            FROM ${table} WHERE ${f} IS NOT NULL;`
}