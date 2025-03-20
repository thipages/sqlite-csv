import { importCsv, sqliteCli } from "../src/index.js"
import test, {describe, after} from 'node:test'
import assert from 'node:assert/strict'
import  {csvPath, dbPath, deleteDbFile} from './misc.js'

describe('Test no data but (with columns names)', () => {
    const path = dbPath()
    after(() => deleteDbFile(path))
    test('with no id', async () => {
        deleteDbFile(path)
        await importCsv(
            path,
            csvPath('no-data-no-id.csv')
        )
        const { runCommands } = sqliteCli(path)
        await runCommands(
            'insert INTO main VALUES (null, 1);'
        )
        const observed = await runCommands(
            'select id from main;'
        )
        assert.deepStrictEqual(observed,
            [{id:1}]
        )
    }) 
    test('with id', async () => {
        deleteDbFile(path)
        await importCsv(
            path,
            csvPath('no-data-id.csv')
        )
        const { runCommands } = sqliteCli(path)
        await runCommands(
            'insert INTO main VALUES (null, 1);'
        )
        const observed = await runCommands(
            'select id from main;'
        )
        assert.deepStrictEqual(observed,
            [{id:1}]
        )
    }) 

})