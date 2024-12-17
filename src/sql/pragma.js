export function wrapPragmaFk(orders) {
    return [
        'PRAGMA foreign_keys=off;',
        ...orders,
        'PRAGMA foreign_keys=on;',
    ]
}
export function wrapTransaction(orders) {
    return [
        'BEGIN TRANSACTION;',
        ...orders,
        'COMMIT;'
    ]
}
export const getFieldNames = (table) => `SELECT name FROM PRAGMA_TABLE_INFO('${table}');`