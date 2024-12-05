import { importCsv } from "./import-csv.js"
import path from 'node:path'
import fs from 'node:fs'
import readline from 'readline'

export async function quickCsv(csvPath, dbPath) {
    let separator, names
    try {
        separator = autodetect(await firstLine(csvPath))
        names = resolveNames(csvPath)
    } catch (e) {
        throw new Error(e.message)
    }
    const [dbPath2, csvTable] = names
    return importCsv(
        dbPath || dbPath2, csvPath, {
            separator,
            csvTable,
            statsTable: csvTable + '_stats'
        }
    )
}
// Auto-detection is limited to comma and semi-colon
// It proceeds at the first line only
function autodetect(firstLine) {
    const lens = [',', ';'].map(
        s => firstLine.split(s).length
    )
    return lens[0] > lens[1] ? ',' : ';'
}
async function firstLine(path) {
    const readable = fs.createReadStream(path);
    const reader = readline.createInterface({ input: readable });
    const line = await new Promise((resolve) => {
      reader.on('line', (line) => {
        reader.close();
        resolve(line);
      });
    });
    readable.close();
    return line;
}
// Resolve dbPath and table name
function resolveNames(csvPath) {
    const {root, dir, name} = path.parse(csvPath)
    return [
        path.join(root, dir, name + '.db'),
        name
    ]
}