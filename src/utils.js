import fs from 'node:fs'
import path from 'node:path'
import readline from 'readline'
export const STATS_SUFFIX = '_stats'
export const TYPES = ['TEXT', 'REAL', 'INTEGER']
export const tempTableName = () => ('temp' + Math.random()).replace('.', '')
// Auto-detection is limited to comma and semi-colon
// It proceeds at the first line only
export function autodetectSeparator(firstLine) {
  const delimiters = [',', ';','\t']
    const lens = delimiters.map(
        s => firstLine.split(s).length
    )
    const max = Math.max(...lens)
    return delimiters[lens.findIndex (v => v === max)]
}
export async function firstLine(path) {
    const readable = fs.createReadStream(path)
    const reader = readline.createInterface({ input: readable })
    const line = await new Promise((resolve) => {
      reader.on('line', (line) => {
        reader.close()
        resolve(line)
      })
    })
    readable.close()
    return line
}
// sqlite3 accepts only path with slash
export function normalizePath (value) {
  return path.sep === '\\' 
    ? value.replace(/\\/g, '/')
    : value
}
export function getFkSqlFromDefinition(definition) {
  const {table, column, references} = definition
  return `FOREIGN KEY("${column}") REFERENCES "${table}"(${references})`
}