export function parseFks(array) {
    const _ = array.map(parseFk)
        .filter(v=>v)
        .reduce(
            (acc, [refTable, fkTable, fkField]) => {
                if (!acc[fkTable]) {
                    acc[fkTable] = {
                        name: fkTable,
                        foreignKeys: []
                    }
                }
                const sql = `FOREIGN KEY("${fkField}") REFERENCES "${refTable}"(id)`
                acc[fkTable].foreignKeys.push(
                    { table: refTable, column: fkField, references: "id", sql }
                )
                return acc
            }, {}
        )
    return Object.values(_)
}

// [refTable, fkTable, fkField] | undefined
function parseFk(s) {
    const res = s.match(/\s*([a-zA-Z_][a-zA-Z0-9_]{0,127})\s*([a-zA-Z_][a-zA-Z0-9_]{0,127})\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]{0,127})\s*\)\s*/)
    return res?.slice(1)
}
