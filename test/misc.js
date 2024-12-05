import fs from 'node:fs'
export const dbPath = (name) => './test/' + name
export const csvPath = (name) => './test/csv-samples/' + name
export function deleteDbFile(path) {
    try {
        fs.unlinkSync(path)
    } catch (e) {
        
    }
}