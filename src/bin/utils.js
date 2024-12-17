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
    const res = s.match(/\s*(\w+)\s*(\w+)\s*\(\s*(\w+)\s*\)\s*/)
    return res?.slice(1)
}
