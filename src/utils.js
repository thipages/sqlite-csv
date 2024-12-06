import fs from 'node:fs'
import path from 'node:path'
import readline from 'readline'
export const STATS_SUFFIX = '_stats'
// Auto-detection is limited to comma and semi-colon
// It proceeds at the first line only
export function autodetectSeparator(firstLine) {
    const lens = [',', ';'].map(
        s => firstLine.split(s).length
    )
    return lens[0] > lens[1] ? ',' : ';'
}
export async function firstLine(path) {
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
// sqlite3 accepts only path with slash
export function normalizePath (value) {
  return path.sep === '\\' 
    ? value.replace(/\\/g, '/')
    : value;
}