import { importCsv, sqliteCli } from "../src/index.js"
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
    'integer + zero (added in version 0.6.0, zero was considered as text)', // 11
    'all empty', // 12
    'column (eg integer) after an all emptycolumn (added in version 0.9.3, due to a shift indiced by null column )', // 13
]
describe('one column import', () => {
    const path = dbPath()
    after(()=>deleteDbFile(path))
    test('one column import)', async () => {
        deleteDbFile(path)
        await importCsv(
            path,
            csvPath('test0.csv')
        )
        const { runCommands } = sqliteCli(path)
        const observed = await runCommands(
            'select col1 from main;'
        )
        assert.deepStrictEqual(
            observed, [ { col1: 10 }, { col1: 20 } ]
        )
    })
})
describe('two columns import with second null column', () => {
    const path = dbPath()
    after(()=>deleteDbFile(path))
    test('two columns import with second null column', async () => {
        deleteDbFile(path)
        await importCsv(
            path,
            csvPath('test5.csv')
        )
        const { runCommands } = sqliteCli(path)
        const observed = await runCommands(
            'select col1, col2 from main;'
        )
        assert.deepStrictEqual(
            observed, [ { col1: 10, col2: null }, { col1: 20, col2: null } ]
        )
    })
})
describe('two columns import with first null column', () => {
    const path = dbPath()
    after(()=>deleteDbFile(path))
    test('two columns import with first null column', async () => {
        deleteDbFile(path)
        await importCsv(
            path,
            csvPath('test6.csv')
        )
        const { runCommands } = sqliteCli(path)
        const observed = await runCommands(
            'select col1, col2 from main;'
        )
        assert.deepStrictEqual(
            observed, [ { col1: null, col2: 10 }, { col1: null, col2: 20 } ]
        )
    })
})
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
