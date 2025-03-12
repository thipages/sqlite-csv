import run from '../../../src/bin/index.js'
import test, {describe} from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { deleteDbFile } from '../../misc.js'
import sqliteCli from '../../../src/sqlite-cli.js'
describe ('npx test delimiter autodetection', () => {
    test('with tab delimiter', async() => {
        const relativeDir = './test/bin/delimiter-auto-detection'
        const dbName = 'test.db'
        const dbPath = path.join(path.resolve(relativeDir), dbName)
        deleteDbFile(dbPath)
        await run(relativeDir, dbName)
        const {runCommands} = sqliteCli(dbPath)
        const observed = await runCommands(
            'select col1, col2 from test1 limit 1;'
        )
        assert.deepStrictEqual(
            observed, [
                {col1:1, col2: 2}
            ]
        )
        deleteDbFile(dbPath)
    })
})
