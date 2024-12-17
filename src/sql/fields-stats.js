import { quote } from "./utils.js"
export default function(fieldsTypes, csvTable) {
    return fieldsTypes
    .map (
        ({field, type}) => {
            const f = quote(field)
            const t = quote(csvTable)
            return [
                type === 0
                    ? stringStats(csvTable, field, type)
                    : numberStats(csvTable, field, type),
                    `SELECT COUNT(DISTINCT ${f}) 'distinct' from ${t} ;`,
                    `SELECT COUNT(*) 'null' from ${t} WHERE ${f} IS NULL;`,
            ]
        }
    )
}
function numberStats(table, field, type) {
    const f = quote(field)
    const t = quote(table)
    return `
        SELECT '${field}' AS field, ${type} type,
            MIN(${f}) AS min,
            MAX(${f}) AS max,
            AVG(${f}) AS avg
        FROM ${t} WHERE ${f} IS NOT NULL;`
}
function stringStats(table, field, type) {
    const f = quote(field)
    const t = quote(table)
    return `SELECT '${field}' AS field, ${type} type,
                MIN(LENGTH(${f})) AS min,
                MAX(LENGTH(${f})) AS max,
                AVG(LENGTH(${f})) AS avg
            FROM ${t} WHERE ${f} IS NOT NULL;`
}