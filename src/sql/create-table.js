import { TYPES, uniqueTempId } from "../utils.js"
// Recreate the table with the right types + set null values
export function recreateTable(csvTable, fieldsTypes, primaryKey, fkRelations) {
    const fields = fieldsTypes.map(v => v.field)
    const tempName = uniqueTempId()
    const [create, existingPkField] = createTable(tempName, fieldsTypes, primaryKey, fkRelations)
    const _ = existingPkField
        ? ['', '']
        : [primaryKey, 'null'].map(v=>v+',')
    const f = fields.map(v=>'\`'+v+'\`').join(',')
    const setNullSql = fields
        .map (
            field => `UPDATE \`${csvTable}\` SET \`${field}\` = NULL WHERE \`${field}\` = '';`
        )
    return [
        create,
        `INSERT INTO ${tempName} (${_[0]} ${f} ) SELECT ${_[1]} ${f} FROM \`${csvTable}\`;`,
        `DROP TABLE \`${csvTable}\`;`,
        `ALTER TABLE ${tempName} RENAME TO \`${csvTable}\`;`,
        ... setNullSql
    ]
}
export function createTable(name, fieldsTypes, pkFieldName, fkRelations) {
    
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
    if (fkRelations && fkRelations.length !== 0) {
        body.push(...fkRelations)
    }
    
    return [
        `CREATE TABLE \`${name}\` ( ${body.join(',')} );`,
        existingPkField
    ]
}