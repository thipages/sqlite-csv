import test, {describe} from 'node:test'
import { importCsv, sqliteCli } from './../src/index.js'
import assert from 'node:assert'
import { unlinkSync } from 'node:fs'
describe.skip ('test uid', async() => {
    try {
        unlinkSync('./test/test.db')
    } catch(e) {}
    const {runCommands} = sqliteCli('./test/test.db')
    await importCsv(
        './test/test.db',
        './test/csv-samples/test1.csv'
    )
    const uid = 1234
    const selectU = `select ${uid} as _;`
    const observed = await runCommands(
        'select col1 from main;',
        selectU ,
        selectU
    )
    assert.ok(true)
})