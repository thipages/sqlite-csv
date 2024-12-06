import { importCsv } from "../src/index.js"
import expected from './expected-stats.js'
import test, {describe, after, before} from 'node:test'
import assert from 'node:assert/strict'
import  {csvPath, dbPath, deleteDbFile} from './misc.js'
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

describe('stats after csv import', () => {
    let observed
    const path = dbPath()
    after(()=> deleteDbFile(path))
    before(
        async() => {
            observed = await importCsv(
                path,
                csvPath('test1.csv'),
                {
                    csvTable: 'aTable',
                    statsTable: 'aTable_stats'
                }
            )
        }
    )
    for (const [index, description] of descriptions.entries()) {
        test(description, () => {
            assert.deepStrictEqual(observed[index], expected[index])
        })
    }  
})
