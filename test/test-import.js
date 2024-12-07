import { importCsv, sqliteCli } from "../src/index.js"
import expected from './expected-stats.js'
import test, {describe, after, before} from 'node:test'
import assert from 'node:assert/strict'
import  {csvPath, dbPath, deleteDbFile} from './misc.js'

describe('csv import', () => {
    const path = dbPath()
    after(()=> deleteDbFile(path))
    test ('no option csv import', async () => {
        await importCsv(
            path,
            csvPath('test1.csv')
        )
        const {oneCall} = sqliteCli(path)
        const observed  = await oneCall(
            'select col1 from main limit 1;'
        )
        assert.deepStrictEqual(observed, [{col1:10}])
    })
})
