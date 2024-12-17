import run from '../../../src/bin/index.js'
import test, {describe} from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { deleteDbFile } from '../../misc.js'
import sqliteCli from '../../../src/sqlite-cli.js'
describe ('simple fks schema', async () => {
    const relativeDir = './test/bin/simple-fks/'
    const dbName = 'test.db'
    const dbPath = path.join(path.resolve(relativeDir), dbName)
    deleteDbFile(dbPath)
    await run(relativeDir, dbName, {
        fk: [
            'departments employees(department_id)'
        ]
    })
    const {runCommands} = sqliteCli(dbPath)
    const observed = await runCommands(
        `select * from pragma_foreign_key_list('employees');`
    )
    assert.ok(observed.length === 1)
    deleteDbFile(dbPath)
})