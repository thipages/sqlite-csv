import { importCsv, sqliteCli } from "../src/index.js"
import expected from './expected.js'
import fs from 'node:fs'
import test, {describe} from 'node:test';
import assert from 'node:assert/strict';
const path = './test/test.db'
if (fs.existsSync(path)) {
    fs.unlinkSync(path)
}
const descriptions = [
    'integer only', // 0
    'integer + null', // 1
    'integer + leading zero number', // 2 
    'integer + starting non digit char', // 3
    'integer + middle non digit char', // 4
    'integer + end non digit char', // 5 
    'integer + decimal', // 6
    'integer + negative integer', // 7
    'integer + negative decimal', // 8
    'integer only with spaced column name ', // 9
    'decimal + string ' // 10
]
describe('stats after csv import', async () => {
    const observed = await importCsv(
        path,
        './test/test.csv'
    )
    for (const [index, description] of descriptions.entries()) {
        test(description, () => {
            assert.deepStrictEqual(observed[index], expected[index])
        })
    }  
})
