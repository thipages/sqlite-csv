import { quote } from "./utils.js"
export default (field, table) => {
    const f = quote(field)
    const t = quote(table)
    return `
        SELECT
            DISTINCT case
                WHEN ${f} regexp '^-?\\d+\\.\\d+$' THEN 1
                WHEN ${f} = 0 THEN 2
                WHEN ${f} regexp '^-?[1-9]\\d*$' THEN 2
                ELSE 0
            END as ${f}
        FROM ${t} WHERE ${f} <>'';
    `
}