import run from './../../src/bin.js'
import test, {describe} from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { deleteDbFile } from '../misc.js'
import sqliteCli from '../../src/sqlite-cli.js'
describe ('npx test', () => {
    test('with database name', async() => {
        const relativeDir = './test/bin'
        const dbName = 'test.db'
        const dbPath = path.join(path.resolve(relativeDir), dbName)
        deleteDbFile(dbPath)
        await run(relativeDir, dbName)
        const {sequentialCalls} = sqliteCli(dbPath)
        const observed = await sequentialCalls(
            'select col1 from test1 limit 1;',
            'select col1 from test2 limit 1;'
        )
        assert.deepStrictEqual(
            observed, [
                [{col1:10}],
                [{col1:1}]
            ]
        )
        deleteDbFile(dbPath)
    })

})
