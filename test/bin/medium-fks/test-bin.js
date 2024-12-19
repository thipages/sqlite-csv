import run from '../../../src/bin/index.js'
import test, {describe} from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { deleteDbFile } from '../../misc.js'
import sqliteCli from '../../../src/sqlite-cli.js'
describe ('medium fks schema', () => {
    test ('medium fks schema', async () => {
        const relativeDir = './test/bin/medium-fks/'
        const dbName = 'test.db'
        const dbPath = path.join(path.resolve(relativeDir), dbName)
        deleteDbFile(dbPath)
        await run(relativeDir, dbName, {
            fk: [
                'departments employees(department_id)',
                'employees employees(manager_id)'
            ]
        })
        const {runCommands} = sqliteCli(dbPath)
        // TODO issue, the second select is not taken into account when no fk is present
        /*const observed = await runCommands(
            `select * from pragma_table_info('employees');`,
            'select 100000000 as _;',
            `select * from pragma_foreign_key_list('employees');`,
            'select 500000000 as _;',
        )*/
        const observed = await runCommands(
            `select * from pragma_foreign_key_list('employees');`
        )
        assert.ok(observed.length === 2)
        deleteDbFile(dbPath)
    })
})
