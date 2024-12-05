import { sqliteCli, quickCsv } from "../src/index.js"
import test, {describe} from 'node:test'
import assert from 'node:assert/strict'
import  {csvPath, dbPath, deleteDbFile} from './misc.js'

describe('Quick csv', () => {
    test('with no db path', async () => {
        const dbName = 'test1.db'
        const path = './test/csv-samples/' + dbName
        deleteDbFile(path)
        await quickCsv(csvPath('test1.csv'))
        const { oneCall } = sqliteCli(path)
        const observed = await oneCall('select col1 from test1 limit 1;')
        assert.deepStrictEqual(observed, [{col1: 10}])
        deleteDbFile(path)
    })
    test('with db path', async () => {
        const path = dbPath('quick.db')
        deleteDbFile(path)
        await quickCsv(csvPath('test1.csv'), path)
        const { oneCall } = sqliteCli(path)
        const observed = await oneCall('select col1 from test1 limit 1;')
        assert.deepStrictEqual(observed, [{col1: 10}])
        deleteDbFile(path)
    })

})