import run from '../../src/bin/index.js'
import test, {describe} from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { deleteDbFile } from '../misc.js'
import sqliteCli from '../../src/sqlite-cli.js'
describe ('npx test', () => {
    test('with comma and semi-colon delimiter', async() => {
        const relativeDir = './test/bin'
        const dbName = 'test.db'
        const dbPath = path.join(path.resolve(relativeDir), dbName)
        deleteDbFile(dbPath)
        await run(relativeDir, dbName)
        const {runCommands} = sqliteCli(dbPath)
        const observed = await runCommands(
            'select col1 from test1 limit 1;',
            'select fk from test2 limit 1;'
        )
        assert.deepStrictEqual(
            observed, [
                [{col1:10}],
                [{fk:1}]
            ]
        )
        deleteDbFile(dbPath)
    })
    test('with tab delimiter', async() => {
        const relativeDir = './test/bin'
        const dbName = 'test.db'
        const dbPath = path.join(path.resolve(relativeDir), dbName)
        deleteDbFile(dbPath)
        await run(relativeDir, dbName)
        const {runCommands} = sqliteCli(dbPath)
        const observed = await runCommands(
            'select col1 from test1 limit 1;',
            'select fk from test2 limit 1;'
        )
        assert.deepStrictEqual(
            observed, [
                [{col1:10}],
                [{fk:1}]
            ]
        )
        deleteDbFile(dbPath)
    })
    test('with -sql option and valid file path', async() => {
        const relativeDir = './test/bin'
        const dbName = 'test.db'
        const dbPath = path.join(path.resolve(relativeDir), dbName)
        const sqlFilePath = path.join(path.resolve(relativeDir), 'insert.sql')
        deleteDbFile(dbPath)
        await run(relativeDir, dbName, {
            sql:  [sqlFilePath]
        })
        const {runCommands} = sqliteCli(dbPath)
        const observed = await runCommands(
            'select count(*) C from test1;'
        )
        assert.deepStrictEqual(
            observed, [ { C: 3 } ]
        )
        deleteDbFile(dbPath)
    })
    test('with -sql option and invalid file path', async() => {
        const relativeDir = './test/bin'
        const dbName = 'test.db'
        const dbPath = path.join(path.resolve(relativeDir), dbName)
        const sqlFilePath = path.join(path.resolve(relativeDir), 'insert2.sql')
        deleteDbFile(dbPath)
        await run(relativeDir, dbName, {
            sql:  [sqlFilePath]
        })
        const {runCommands} = sqliteCli(dbPath)
        const observed = await runCommands(
            'select count(*) C from test1;'
        )
        assert.deepStrictEqual(
            observed, [ { C: 2 } ]
        )
        deleteDbFile(dbPath)
    })
})
