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
    'decimal + string ', // 10
    'integer + zero (added in version 0.6.0, zero was considered as text)' // 11
]
describe('stats after csv import', async () => {
    const observed = await importCsv(
        path,
        './test/test1.csv',
        {
            csvTable: 'group',
            statsTable: 'groupStats'
        }
    )
    for (const [index, description] of descriptions.entries()) {
        test(description, () => {
            assert.deepStrictEqual(observed[index], expected[index])
        })
    }  
})
describe('csv import with errors', async () => {
    let error=''
    try {
            await importCsv(
            path,
            './test/test2.csv',
            {
                csvTable: 'invalid',
                statsTable: 'invalid_stats'
            }
        )
    } catch (err) {
        error = err.message
    }
    test('catch of sqlite error message', () => {
        assert.ok(error.includes('expected 2 columns but found 1 - filling the rest with NULL'))
    })
})
