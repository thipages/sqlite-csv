import run from '../../../src/bin/index.js'
import test, {describe} from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { deleteDbFile } from '../../misc.js'
import sqliteCli from '../../../src/sqlite-cli.js'
describe ('complex fks schema', async () => {
    const relativeDir = './test/bin/complex-fks/'
    const dbName = 'test.db'
    const dbPath = path.join(path.resolve(relativeDir), dbName)
    deleteDbFile(dbPath)
    await run(relativeDir, dbName, {
        fk: [
            'clients contracts(client_id)',
            'projects contracts(project_id)',
            'contracts invoices(contract_id)',
            'projects tasks(project_id)',
            'clients  tasks(assignee_id)'
        ]
    })
    const {runCommands} = sqliteCli(dbPath)
    const observed = await runCommands(
        `select * from pragma_foreign_key_list('tasks');`
    )
    assert.deepStrictEqual(observed.length, 2)
    deleteDbFile(dbPath)
})
