// Compute statistics
export default function(fieldsTypes, csvTable) {
    return fieldsTypes
    .map (
        ({field, type}) => [
            type === 0
                ? stringStats(csvTable, field, type)
                : numberStats(csvTable, field, type),
                `SELECT COUNT(DISTINCT ${field}) 'distinct' from ${csvTable} ;`,
                `SELECT COUNT(*) 'null' from ${csvTable} WHERE ${field} IS NULL;`,
        ]
    )
}
function numberStats(table, field, type) {
    return `
        SELECT '${field}' field, ${type} type,
            MIN(${field}) min,
            MAX(${field}) max,
            AVG(${field}) avg
        FROM ${table} WHERE ${field} IS NOT NULL;`
}
function stringStats(table, field, type) {
    return `SELECT '${field}' field, ${type} type,
                MIN(LENGTH(${field})) min,
                MAX(LENGTH(${field})) max,
                AVG(LENGTH(${field})) avg
            FROM ${table} WHERE ${field} IS NOT NULL;`
}