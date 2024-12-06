import fs from 'node:fs'
import path from 'node:path'
export const dbPath = () => './test/' + getBase()
export const csvPath = (name) => './test/csv-samples/' + name
export function deleteDbFile(path) {
    try {
        fs.unlinkSync(path)
    } catch (e) {
        
    }
}
function getBase() {
    const filePath = global.process.argv[1]
    return path.basename(filePath, path.extname(filePath)).replace(/-/g, '_')
}